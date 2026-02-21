import React, { useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  Users,
  Shield,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const InterviewRoomPage = () => {
  // Extract interview ID from hash URL (e.g., #/interview-room?id=123)
  const getInterviewId = () => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]id=(\d+)/);
    return match ? match[1] : null;
  };

  const interviewId = getInterviewId();

  const [darkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [interviewData, setInterviewData] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [mediaError, setMediaError] = useState(null);
  const [deepfakeResult, setDeepfakeResult] = useState(null);
  const [isCheckingDeepfake, setIsCheckingDeepfake] = useState(false);
  const [deepfakeHistory, setDeepfakeHistory] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingIntervalRef = useRef(null);
  const token = localStorage.getItem("token");

  // Get user role from user object in localStorage
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    return null;
  };

  const userRole = getUserRole();

  // ICE servers configuration (using free STUN servers)
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!interviewId) {
      window.location.hash = "/";
      return;
    }

    console.log("[MOUNT] Component mounted, initializing...");
    loadInterviewData();
    initializeMedia();

    return () => {
      console.log("[UNMOUNT] Cleaning up...");
      cleanup();
    };
  }, []); // Empty dependency array - only run once on mount

  // Ensure remote video updates when stream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("[EFFECT] Setting remote stream on video element");

      // Enable all audio tracks
      const audioTracks = remoteStream.getAudioTracks();
      console.log("[EFFECT] Remote audio tracks:", audioTracks.length);
      audioTracks.forEach((track, idx) => {
        console.log(`[EFFECT] Audio track ${idx}:`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        });
        track.enabled = true; // Ensure audio track is enabled
      });

      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.volume = 1.0; // Set volume to maximum
      remoteVideoRef.current.muted = false; // Ensure not muted

      remoteVideoRef.current
        .play()
        .then(() => {
          console.log("[EFFECT] Remote video playing");
          console.log(
            "[EFFECT] Video element volume:",
            remoteVideoRef.current.volume
          );
          console.log(
            "[EFFECT] Video element muted:",
            remoteVideoRef.current.muted
          );
        })
        .catch((err) => console.error("[EFFECT] Error playing:", err));
    }
  }, [remoteStream]);

  const loadInterviewData = async () => {
    try {
      const endpoint =
        userRole === "recruiter"
          ? `${API_BASE_URL}/api/interviews/recruiter/`
          : `${API_BASE_URL}/api/interviews/candidate/`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interview = res.data.find((iv) => iv.id === parseInt(interviewId));
      if (interview) {
        setInterviewData(interview);
      }
    } catch (error) {
      console.error("Error loading interview:", error);
    }
  };

  const initializeMedia = async () => {
    // Prevent re-initialization if already initialized
    if (localStream) {
      console.log("[INIT MEDIA] Already initialized, skipping...");
      return;
    }

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "getUserMedia is not supported in this browser or context. Please use HTTPS or access from localhost."
        );
      }

      console.log("[INIT MEDIA] Requesting camera and microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log(
        "[INIT MEDIA] Media access granted, tracks:",
        stream.getTracks().length
      );

      // Log all tracks to verify audio is captured
      stream.getTracks().forEach((track, idx) => {
        console.log(`[INIT MEDIA] Track ${idx} (${track.kind}):`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label,
        });
        // Ensure all tracks are enabled
        track.enabled = true;
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setConnectionStatus("Ready");
      setupPeerConnection(stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      let errorMessage = "Could not access camera/microphone. ";

      if (
        error.message &&
        error.message.includes("getUserMedia is not supported")
      ) {
        errorMessage = "⚠️ SECURE CONNECTION REQUIRED\n\n";
        errorMessage +=
          "Camera and microphone access requires a secure connection.\n\n";
        errorMessage += "Solutions:\n";
        errorMessage +=
          "1. Access from laptop 1 (host): http://localhost:5173\n";
        errorMessage +=
          "2. Access from laptop 2: http://192.168.100.12:5173 (Chrome may block)\n";
        errorMessage +=
          "3. Best solution: Set up HTTPS with a self-signed certificate\n\n";
        errorMessage +=
          "Note: Chrome and modern browsers block camera/microphone on non-HTTPS connections (except localhost).";
      } else if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage +=
          "Permission denied. Please allow camera and microphone access in browser settings.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage += "No camera or microphone found.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage +=
          "Camera or microphone is already in use by another application.\n\nTip: If testing on the same computer, try:\n• Using different physical devices (e.g., laptop camera vs USB webcam)\n• Closing other browser tabs using the camera\n• Using audio-only mode (click Continue to try audio only)";

        // Try audio-only as fallback
        const tryAudioOnly = confirm(
          errorMessage + "\n\nContinue with audio only?"
        );
        if (tryAudioOnly) {
          try {
            console.log("Trying audio-only mode...");
            const audioStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            console.log("Audio-only mode active");
            setLocalStream(audioStream);
            setIsVideoOn(false);
            setConnectionStatus("Ready (Audio Only)");
            setupPeerConnection(audioStream);
            return;
          } catch (audioError) {
            console.error("Audio-only mode also failed:", audioError);
          }
        }
      } else {
        errorMessage += error.message;
      }

      // Display error silently on the page instead of alert
      setMediaError(errorMessage);
      setConnectionStatus("Media Error: " + error.name);
    }
  };

  const setupPeerConnection = async (stream) => {
    // Prevent multiple peer connection setups
    if (peerConnectionRef.current) {
      console.log("[SETUP] Peer connection already exists, skipping...");
      return;
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    console.log(
      "[SETUP] Creating peer connection with ICE servers:",
      iceServers
    );

    // Verify stream has both video and audio tracks
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    console.log(
      `[SETUP] Stream tracks - Video: ${videoTracks.length}, Audio: ${audioTracks.length}`
    );

    if (audioTracks.length === 0) {
      console.error(
        "[SETUP] ⚠️ WARNING: No audio tracks found! Microphone may not be working."
      );
      alert(
        "WARNING: No microphone detected! Please check your microphone permissions and device."
      );
    } else {
      console.log("[SETUP] ✓ Audio track found:", {
        label: audioTracks[0].label,
        enabled: audioTracks[0].enabled,
        muted: audioTracks[0].muted,
        readyState: audioTracks[0].readyState,
      });
    }

    // Add local stream tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
      console.log(
        `[SETUP] ✓ Added ${track.kind} track to peer connection (enabled: ${track.enabled}, muted: ${track.muted})`
      );
    });

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log(
        "[ONTRACK] Remote track received:",
        event.track.kind,
        "readyState:",
        event.track.readyState,
        "enabled:",
        event.track.enabled,
        "muted:",
        event.track.muted
      );

      // Enable the track explicitly
      event.track.enabled = true;

      if (event.streams && event.streams[0]) {
        console.log(
          "[ONTRACK] Remote stream available, tracks:",
          event.streams[0].getTracks().length
        );
        console.log("[ONTRACK] Stream ID:", event.streams[0].id);
        console.log("[ONTRACK] Stream active:", event.streams[0].active);

        // Log all tracks
        event.streams[0].getTracks().forEach((track, idx) => {
          console.log(`[ONTRACK] Track ${idx} (${track.kind}):`, {
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
          });
        });

        setRemoteStream(event.streams[0]);

        // Set stream on video element immediately
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.volume = 1.0; // Ensure volume is at max
          remoteVideoRef.current.muted = false; // Ensure not muted
          console.log("[ONTRACK] Remote video element updated");

          // Ensure video plays
          remoteVideoRef.current
            .play()
            .then(() => console.log("[ONTRACK] Remote video playing"))
            .catch((err) =>
              console.error("[ONTRACK] Error playing remote video:", err)
            );
        } else {
          console.error("[ONTRACK] Remote video ref is null!");
        }
        setConnectionStatus("Connected");
      } else {
        console.warn("[ONTRACK] No streams in event");
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[ICE] New ICE candidate:", event.candidate.type);
        sendSignal({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      } else {
        console.log("[ICE] ICE gathering complete");
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[CONNECTION STATE] ${pc.connectionState}`);
      setConnectionStatus(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[ICE CONNECTION STATE] ${pc.iceConnectionState}`);
    };

    pc.onicegatheringstatechange = () => {
      console.log(`[ICE GATHERING STATE] ${pc.iceGatheringState}`);
    };

    setPeerConnection(pc);

    // Start signaling after peer connection is set up
    startSignaling();

    // If recruiter, wait a bit for ICE gathering to start, then create offer
    if (userRole === "recruiter") {
      console.log("[RECRUITER] Waiting for ICE gathering to start...");
      setTimeout(() => {
        createOffer(pc);
      }, 1000);
    }
  };

  const createOffer = async (pc) => {
    try {
      console.log("Recruiter creating offer...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Offer created and set as local description");
      sendSignal({
        type: "offer",
        offer: offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      setConnectionStatus("Error creating offer");
    }
  };

  const handleSignal = async (signal) => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.log("Peer connection not ready yet");
      return;
    }

    try {
      console.log(
        `[HANDLE SIGNAL] Type: ${signal.type}, Current state: ${pc.signalingState}`
      );

      if (signal.type === "offer" && userRole === "candidate") {
        console.log("Candidate received offer, creating answer...");
        await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
        console.log(
          `[HANDLE SIGNAL] Remote description set, state: ${pc.signalingState}`
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Answer created and sent");
        sendSignal({
          type: "answer",
          answer: answer,
        });
      } else if (signal.type === "answer" && userRole === "recruiter") {
        console.log("Recruiter received answer, setting remote description...");
        await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
        console.log(
          `[HANDLE SIGNAL] Remote description set, state: ${pc.signalingState}`
        );
      } else if (signal.type === "ice-candidate") {
        console.log(
          `[ICE] Received ICE candidate, candidate type: ${signal.candidate.type}`
        );
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          console.log("[ICE] ICE candidate added successfully");
        } else {
          console.log(
            "[ICE] Waiting for remote description before adding ICE candidate"
          );
          // Store ICE candidate to add later
          setTimeout(() => {
            if (pc.remoteDescription) {
              pc.addIceCandidate(new RTCIceCandidate(signal.candidate))
                .then(() => console.log("[ICE] Delayed ICE candidate added"))
                .catch((err) =>
                  console.error("[ICE] Error adding delayed candidate:", err)
                );
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("[HANDLE SIGNAL] Error:", error);
      setConnectionStatus("Signaling error: " + error.message);
    }
  };

  const sendSignal = async (signal) => {
    try {
      console.log(`[SEND SIGNAL] Type: ${signal.type}, Role: ${userRole}`);
      const response = await axios.post(
        `${API_BASE_URL}/api/interviews/${interviewId}/signal/`,
        { signal, role: userRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`[SEND SIGNAL] Success:`, response.data);
    } catch (error) {
      console.error("[SEND SIGNAL] Error:", error);
    }
  };

  const startSignaling = () => {
    // Clear any existing interval
    if (signalingIntervalRef.current) {
      console.log(
        "[START SIGNALING] Already running, clearing previous interval"
      );
      clearInterval(signalingIntervalRef.current);
    }

    console.log(
      `[START SIGNALING] Role: ${userRole}, Interview ID: ${interviewId}`
    );

    // Poll for signals every 2 seconds
    signalingIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/interviews/${interviewId}/signals/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data && res.data.length > 0) {
          console.log(
            `[POLL SIGNALS] Received ${res.data.length} signals:`,
            res.data
          );
          res.data.forEach((signal) => handleSignal(signal));
        }
      } catch (error) {
        console.error("[POLL SIGNALS] Error:", error);
      }
    }, 2000);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        const newState = !audioTrack.enabled;
        audioTrack.enabled = newState;
        setIsAudioOn(newState);
        console.log(`[TOGGLE AUDIO] Audio ${newState ? "ENABLED" : "MUTED"}`);
        console.log("[TOGGLE AUDIO] Track state:", {
          enabled: audioTrack.enabled,
          muted: audioTrack.muted,
          readyState: audioTrack.readyState,
          label: audioTrack.label,
        });
      } else {
        console.error("[TOGGLE AUDIO] No audio track found!");
        alert(
          "No microphone detected. Please check your device and permissions."
        );
      }
    } else {
      console.error("[TOGGLE AUDIO] No local stream available!");
    }
  };

  const endCall = () => {
    cleanup();
    window.location.hash =
      userRole === "recruiter"
        ? "/recruiter-interviews"
        : "/candidate-interviews";
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (signalingIntervalRef.current) {
      clearInterval(signalingIntervalRef.current);
      signalingIntervalRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        text: messageInput,
        sender: userRole,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setMessageInput("");
    }
  };

  const captureAndCheckDeepfake = async () => {
    if (!remoteVideoRef.current || !remoteStream) {
      setDeepfakeResult({
        error: "No video stream available to analyze",
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // Get fresh token from localStorage
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      setDeepfakeResult({
        error: "Not authenticated. Please log in again.",
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    setIsCheckingDeepfake(true);
    setDeepfakeResult(null);

    try {
      // Create a canvas to capture the current frame
      const video = remoteVideoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.95);

      // Send to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/deepfake/detect/`,
        { image: imageData },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = {
        ...response.data,
        timestamp: new Date().toLocaleTimeString(),
      };

      setDeepfakeResult(result);
      setDeepfakeHistory((prev) => [result, ...prev].slice(0, 10)); // Keep last 10 results
    } catch (error) {
      console.error("Deepfake detection error:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.error || "Failed to analyze video. Please try again.";
      const errorDetails = error.response?.data?.details || "";
      
      setDeepfakeResult({
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsCheckingDeepfake(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b ${
          darkMode
            ? "bg-slate-800/80 border-slate-700/50"
            : "bg-white/80 border-blue-100/50"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Interview Room
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {interviewData
                  ? userRole === "recruiter"
                    ? `With ${interviewData.candidate_name}`
                    : `With ${interviewData.recruiter_name}`
                  : "Loading..."}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                connectionStatus === "connected"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-orange-600/20 text-orange-400"
              }`}
            >
              {connectionStatus}
            </div>
          </div>

          {/* Media Error Alert */}
          {mediaError && (
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <p className="text-red-400 text-sm whitespace-pre-line">
                {mediaError}
              </p>
              <button
                onClick={() => setMediaError(null)}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Video Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Remote Video (larger) */}
          <div className="lg:col-span-2">
            <div
              className={`relative rounded-2xl overflow-hidden aspect-video ${
                darkMode ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Users
                      size={64}
                      className={darkMode ? "text-slate-600" : "text-slate-400"}
                    />
                    <p
                      className={`mt-4 font-semibold ${
                        darkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Waiting for other participant...
                    </p>
                  </div>
                </div>
              )}
              {remoteStream &&
                (remoteStream.getVideoTracks().length === 0 ||
                  !remoteStream
                    .getVideoTracks()
                    .some(
                      (track) => track.enabled && track.readyState === "live"
                    )) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                    <div className="text-center">
                      <VideoOff
                        size={64}
                        className="text-slate-400 mx-auto mb-4"
                      />
                      <p className="text-slate-300 font-semibold">
                        {interviewData
                          ? userRole === "recruiter"
                            ? interviewData.candidate_name
                            : interviewData.recruiter_name
                          : "Participant"}{" "}
                        is in audio-only mode
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Local Video (smaller) + Chat */}
          <div className="space-y-4">
            <div
              className={`relative rounded-2xl overflow-hidden aspect-video ${
                darkMode ? "bg-slate-800" : "bg-slate-200"
              }`}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <VideoOff size={48} className="text-white" />
                </div>
              )}
              {/* Microphone Status Indicator */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                {isAudioOn ? (
                  <div className="bg-green-500/90 text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs font-semibold">
                    <Mic size={14} />
                    <span>Mic ON</span>
                  </div>
                ) : (
                  <div className="bg-red-500/90 text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs font-semibold">
                    <MicOff size={14} />
                    <span>Mic OFF</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Panel */}
            {isChatOpen && (
              <div
                className={`rounded-2xl border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-blue-100"
                } p-4 h-96 flex flex-col`}
              >
                <h3
                  className={`font-bold mb-4 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Chat
                </h3>
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg ${
                        msg.sender === userRole
                          ? darkMode
                            ? "bg-indigo-600/30 text-indigo-200 ml-8"
                            : "bg-blue-100 text-blue-900 ml-8"
                          : darkMode
                          ? "bg-slate-700 text-slate-200 mr-8"
                          : "bg-slate-100 text-slate-900 mr-8"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoOn
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              isAudioOn
                ? "bg-slate-700 hover:bg-slate-600 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all"
          >
            <MessageSquare size={24} />
          </button>
          <button
            onClick={captureAndCheckDeepfake}
            disabled={isCheckingDeepfake || !remoteStream}
            className={`p-4 rounded-full transition-all ${
              isCheckingDeepfake || !remoteStream
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
            title="Check for deepfake"
          >
            <Shield size={24} />
          </button>
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Deepfake Detection Results */}
        {deepfakeResult && (
          <div className="max-w-4xl mx-auto">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-blue-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  <Shield size={24} />
                  Deepfake Detection Results
                </h3>
                <span
                  className={`text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {deepfakeResult.timestamp}
                </span>
              </div>

              {deepfakeResult.error ? (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold">Error</p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-red-300" : "text-red-600"
                      }`}
                    >
                      {deepfakeResult.error}
                    </p>
                    {deepfakeResult.details && (
                      <details className="mt-2">
                        <summary className={`text-xs cursor-pointer ${
                          darkMode ? "text-red-400" : "text-red-700"
                        }`}>
                          Technical Details
                        </summary>
                        <pre className={`mt-2 text-xs p-2 rounded overflow-auto max-h-40 ${
                          darkMode ? "bg-slate-900 text-slate-300" : "bg-red-50 text-red-900"
                        }`}>
                          {deepfakeResult.details}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`p-6 rounded-xl ${
                      deepfakeResult.prediction === "REAL"
                        ? "bg-green-500/20 border-2 border-green-500"
                        : "bg-red-500/20 border-2 border-red-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Prediction
                        </p>
                        <p
                          className={`text-3xl font-bold ${
                            deepfakeResult.prediction === "REAL"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {deepfakeResult.prediction}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium mb-1 ${
                            darkMode ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Confidence
                        </p>
                        <p
                          className={`text-3xl font-bold ${
                            deepfakeResult.prediction === "REAL"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {(deepfakeResult.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-slate-700" : "bg-slate-100"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-3 ${
                        darkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Detailed Probabilities
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span
                            className={
                              darkMode ? "text-green-400" : "text-green-600"
                            }
                          >
                            Real
                          </span>
                          <span
                            className={
                              darkMode ? "text-green-400" : "text-green-600"
                            }
                          >
                            {(deepfakeResult.probabilities.REAL * 100).toFixed(
                              2
                            )}
                            %
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-full h-2 ${
                            darkMode ? "bg-slate-600" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                deepfakeResult.probabilities.REAL * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span
                            className={
                              darkMode ? "text-red-400" : "text-red-600"
                            }
                          >
                            Fake
                          </span>
                          <span
                            className={
                              darkMode ? "text-red-400" : "text-red-600"
                            }
                          >
                            {(deepfakeResult.probabilities.FAKE * 100).toFixed(
                              2
                            )}
                            %
                          </span>
                        </div>
                        <div
                          className={`w-full rounded-full h-2 ${
                            darkMode ? "bg-slate-600" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                deepfakeResult.probabilities.FAKE * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {deepfakeResult.model_loaded && (
                    <div
                      className={`text-xs ${
                        darkMode ? "text-slate-400" : "text-slate-500"
                      } text-center`}
                    >
                      Model: best_model.pt • Device: {deepfakeResult.device}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isCheckingDeepfake && (
          <div className="max-w-4xl mx-auto mt-6">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-blue-100"
              } flex items-center justify-center`}
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p
                  className={`font-semibold ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Analyzing video for deepfake detection...
                </p>
                <p
                  className={`text-sm mt-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  This may take a few seconds
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default InterviewRoomPage;

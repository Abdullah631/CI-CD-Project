import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

/* ======================================================
   Interview Room – Pro UI + Deepfake Detection
   ====================================================== */

const InterviewRoomPage = () => {
  /* ------------------ Helpers ------------------ */
  const getInterviewId = () => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]id=(\d+)/);
    return match ? match[1] : null;
  };

  const interviewId = getInterviewId();
  const token = localStorage.getItem("token");

  const getUserRole = () => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.role;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();

  /* ------------------ State ------------------ */
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [interviewData, setInterviewData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting…");
  const [participantLeft, setParticipantLeft] = useState(false);

  /* Deepfake */
  const [dfLoading, setDfLoading] = useState(false);
  const [dfResult, setDfResult] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingIntervalRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  /* ------------------ ICE ------------------ */
  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  /* ------------------ Lifecycle ------------------ */
  useEffect(() => {
    loadInterviewData();
    initializeMedia();
    return () => cleanup();
  }, []);

  /* ------------------ Interview Data ------------------ */
  const loadInterviewData = async () => {
    try {
      const endpoint =
        userRole === "recruiter"
          ? `${API_BASE_URL}/api/interviews/recruiter/`
          : `${API_BASE_URL}/api/interviews/candidate/`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInterviewData(res.data.find((i) => i.id === Number(interviewId)));
    } catch (e) {
      console.error(e);
    }
  };

  /* ------------------ Media ------------------ */
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        try {
          localVideoRef.current.srcObject = stream;
          // some browsers require an explicit play call
          await localVideoRef.current.play().catch(() => {});
        } catch (e) {
          console.warn("Failed to play local video immediately", e);
        }
      }

      setupPeerConnection(stream);
      setConnectionStatus("Ready");
    } catch (err) {
      console.error("Could not access camera/microphone:", err);
      setConnectionStatus("Camera access denied");
      setLocalStream(null);
    }
  };

  /* ------------------ WebRTC ------------------ */
  const setupPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        // autoplay remote if possible
        remoteVideoRef.current.play().catch(() => {});
      }
      setConnectionStatus("Connected");
    };

    pc.onicecandidate = (e) => {
      if (e.candidate)
        sendSignal({ type: "ice-candidate", candidate: e.candidate });
    };

    startSignaling();
    if (userRole === "recruiter") createOffer(pc);
  };

  const createOffer = async (pc) => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: "offer", offer });
  };

  const handleSignal = async (signal) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    if (pc.signalingState === "closed") {
      console.warn(
        "Received signal but RTCPeerConnection is closed — ignoring"
      );
      return;
    }

    if (signal.type === "offer" && userRole === "candidate") {
      if (!pc || pc.signalingState === "closed") {
        console.warn("Can't set remote description; pc not ready or closed");
        return;
      }
      await pc.setRemoteDescription(signal.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: "answer", answer });
      // flush any queued ICE candidates received before remote description
      if (pendingCandidatesRef.current.length) {
        for (const c of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(c);
          } catch (e) {
            console.warn("Failed to add queued candidate:", e);
          }
        }
        pendingCandidatesRef.current = [];
      }
    }

    if (signal.type === "answer" && userRole === "recruiter") {
      if (!pc || pc.signalingState === "closed") {
        console.warn(
          "Can't set remote description (answer); pc not ready or closed"
        );
        return;
      }
      await pc.setRemoteDescription(signal.answer);
      // flush any queued ICE candidates received before remote description
      if (pendingCandidatesRef.current.length) {
        for (const c of pendingCandidatesRef.current) {
          try {
            await pc.addIceCandidate(c);
          } catch (e) {
            console.warn("Failed to add queued candidate:", e);
          }
        }
        pendingCandidatesRef.current = [];
      }
    }

    if (signal.type === "ice-candidate") {
      // remoteDescription must be set before adding candidates
      try {
        if (pc.signalingState === "closed") {
          console.warn("Skipping addIceCandidate because pc is closed");
          return;
        }
        const hasRemote = pc.remoteDescription && pc.remoteDescription.type;
        if (hasRemote) {
          await pc.addIceCandidate(signal.candidate);
        } else {
          // queue candidate until remote description is available
          pendingCandidatesRef.current.push(signal.candidate);
        }
      } catch (e) {
        console.warn("Error adding ICE candidate:", e);
      }
    }

    if (signal.type === "participant-left") {
      setParticipantLeft(true);
      setRemoteStream(null);
    }
  };

  const sendSignal = async (signal) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/interviews/${interviewId}/signal/`,
        { signal, role: userRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn("sendSignal error:", err?.message || err);
    }
  };

  const startSignaling = () => {
    signalingIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/interviews/${interviewId}/signals/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res && Array.isArray(res.data)) {
          res.data.forEach(handleSignal);
        }
      } catch (err) {
        console.warn("startSignaling poll error:", err?.message || err);
      }
    }, 2000);
  };

  /* ------------------ Controls ------------------ */
  const toggleVideo = () => {
    const t = localStream?.getVideoTracks()[0];
    if (t) setIsVideoOn((t.enabled = !t.enabled));
  };

  const toggleAudio = () => {
    const t = localStream?.getAudioTracks()[0];
    if (t) setIsAudioOn((t.enabled = !t.enabled));
  };

  const endCall = () => {
    cleanup();
    window.location.hash =
      userRole === "recruiter"
        ? "/recruiter-interviews"
        : "/candidate-interviews";
  };

  const cleanup = () => {
    try {
      localStream?.getTracks().forEach((t) => t.stop());
    } catch (e) {
      console.warn("Error stopping local tracks", e);
    }

    try {
      peerConnectionRef.current?.close();
    } catch (e) {
      console.warn("Error closing peer connection", e);
    }

    // Clear refs and intervals
    peerConnectionRef.current = null;
    pendingCandidatesRef.current = [];
    clearInterval(signalingIntervalRef.current);
    signalingIntervalRef.current = null;

    try {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    } catch (e) {
      console.warn("Error clearing video srcObject", e);
    }

    setLocalStream(null);
    setRemoteStream(null);
  };

  /* ------------------ Deepfake Detection ------------------ */
  const runDeepfakeCheck = async () => {
    setDfLoading(true);
    setDfResult(null);

    try {
      // Choose the video element to capture: prefer remote (participant) when available
      const videoEl = remoteVideoRef.current || localVideoRef.current;
      if (!videoEl) throw new Error("No video available to capture");

      // Create canvas and draw current frame
      const canvas = document.createElement("canvas");
      const width = 640;
      const height =
        Math.round((videoEl.videoHeight / videoEl.videoWidth) * width) || 360;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0, width, height);

      // Convert canvas to blob
      const blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b || null), "image/jpeg", 0.85)
      );
      if (!blob) throw new Error("Failed to capture image");

      // Prepare form data
      const form = new FormData();
      form.append("interview_id", interviewId);
      form.append("image", blob, `screenshot_${interviewId}.jpg`);

      const res = await axios.post(
        `${API_BASE_URL}/api/deepfake/check/`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setDfResult(res.data);
    } catch (err) {
      console.error("Deepfake check error:", err);
      setDfResult({
        verdict: "unknown",
        confidence: 0,
        message: err?.message || "Detection failed",
      });
    } finally {
      setDfLoading(false);
    }
  };

  /* ======================================================
     UI
     ====================================================== */
  return (
    <div className="app-shell bg-[var(--bg)] min-h-screen">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-[var(--border-strong)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Interview Room
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {interviewData
                ? userRole === "recruiter"
                  ? interviewData.candidate_name
                  : interviewData.recruiter_name
                : "Connecting…"}
            </p>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background:
                connectionStatus === "Connected"
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(234,179,8,0.12)",
              color: connectionStatus === "Connected" ? "#16a34a" : "#a16207",
            }}
          >
            {connectionStatus}
          </span>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="relative flex gap-6">
          {/* ---------- REMOTE VIDEO ---------- */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)]">
                <p className="font-medium">
                  {participantLeft
                    ? "Participant left"
                    : "Waiting for participant"}
                </p>
              </div>
            )}

            <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs bg-black/50 text-white">
              {interviewData
                ? userRole === "recruiter"
                  ? interviewData.candidate_name
                  : interviewData.recruiter_name
                : "Participant"}
            </span>
          </div>

          {/* ---------- SIDE PANEL ---------- */}
          <div className="w-64 flex flex-col gap-4">
            {/* Self video */}
            <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-sm">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                You
              </span>
            </div>

            {/* Deepfake check */}
            <div className="rounded-xl border border-[var(--border-strong)] bg-white px-4 py-4">
              <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">
                Identity Check
              </p>

              <button
                onClick={runDeepfakeCheck}
                disabled={dfLoading}
                className="w-full py-2 rounded-lg text-sm font-semibold transition"
                style={{
                  background: dfLoading
                    ? "var(--surface-1)"
                    : "linear-gradient(135deg,var(--cinnamon),var(--sage))",
                  color: "var(--cream)",
                  opacity: dfLoading ? 0.6 : 1,
                }}
              >
                {dfLoading ? "Analyzing…" : "Run Check"}
              </button>

              {dfResult && (
                <div
                  className="mt-3 px-3 py-2 rounded-lg text-xs font-medium border"
                  style={{
                    background:
                      dfResult.verdict === "real"
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(220,38,38,0.1)",
                    borderColor:
                      dfResult.verdict === "real"
                        ? "rgba(34,197,94,0.3)"
                        : "rgba(220,38,38,0.3)",
                    color: dfResult.verdict === "real" ? "#16a34a" : "#dc2626",
                  }}
                >
                  {dfResult.verdict.toUpperCase()} • {dfResult.confidence}%
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= CONTROLS ================= */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center">
        <div className="flex gap-3 bg-white/80 backdrop-blur px-5 py-3 rounded-full border border-[var(--border-strong)] shadow-md">
          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isVideoOn
                ? "bg-[var(--sage)] text-white"
                : "bg-red-500 text-white"
            }`}
          >
            Camera
          </button>

          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isAudioOn
                ? "bg-[var(--sage)] text-white"
                : "bg-red-500 text-white"
            }`}
          >
            Mic
          </button>

          <button
            onClick={endCall}
            className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold"
          >
            End
          </button>
        </div>
      </div>

      <style>{`.mirror{transform:scaleX(-1)}`}</style>
    </div>
  );
};

export default InterviewRoomPage;

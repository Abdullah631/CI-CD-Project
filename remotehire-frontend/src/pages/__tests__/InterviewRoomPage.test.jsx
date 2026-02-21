import { render, screen } from "@testing-library/react";
import InterviewRoomPage from "../InterviewRoomPage";

describe("InterviewRoomPage", () => {
  it("renders header when interview id present", () => {
    // Ensure an interview id exists in the hash
    window.location.hash = "#/interview-room?id=1";
    // Simulate unsupported media to avoid real device access
    Object.defineProperty(window.navigator, "mediaDevices", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    render(<InterviewRoomPage />);
    expect(screen.getByText(/Interview Room/i)).toBeInTheDocument();
  });
});

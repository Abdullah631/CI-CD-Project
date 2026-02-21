import { render, screen, fireEvent } from "@testing-library/react";
import { LandingNav } from "../components/LandingNav";
import { CandidateNav } from "../components/CandidateNav";
import RecruiterNav from "../components/RecruiterNav";
import JobDetailsModal from "../components/JobDetailsModal";
import { LandingPage } from "../pages/LandingPage";
import { Header } from "../components/Header";

describe("Frontend Features", () => {
  it("LandingNav toggles dark mode via handler", () => {
    const onToggle = vi.fn();
    render(<LandingNav darkMode={false} onToggleDarkMode={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle dark mode/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("LandingPage persists dark mode to localStorage", () => {
    render(<LandingPage />);
    const toggleBtn = screen.getByRole("button", { name: /toggle dark mode/i });
    fireEvent.click(toggleBtn);
    expect(window.localStorage.getItem("darkMode")).toMatch(/^(true|false)$/);
  });

  it("CandidateNav logout clears token and user", () => {
    window.localStorage.setItem("user", "u");
    window.localStorage.setItem("token", "t");
    render(<CandidateNav darkMode={false} onToggleDarkMode={() => {}} userName="A" currentPage="dashboard" />);
    const logoutButtons = screen.getAllByTitle(/logout/i);
    fireEvent.click(logoutButtons[0]);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("user");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
  });

  it("RecruiterNav logout clears token and user", () => {
    window.localStorage.setItem("user", "u");
    window.localStorage.setItem("token", "t");
    render(<RecruiterNav darkMode={false} onToggleDarkMode={() => {}} userName="R" currentPage="dashboard" />);
    const logoutButtons = screen.getAllByTitle(/logout/i);
    fireEvent.click(logoutButtons[0]);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("user");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
  });

  it("JobDetailsModal apply triggers callback and closes", () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    const job = { id: 10, title: "Role", requirements: {} };
    render(<JobDetailsModal job={job} isOpen={true} onClose={onClose} darkMode={false} onApply={onApply} isApplied={false} />);
    fireEvent.click(screen.getByRole("button", { name: /apply now/i }));
    expect(onApply).toHaveBeenCalledWith(10);
    expect(onClose).toHaveBeenCalled();
  });

  it("JobDetailsModal apply disabled when already applied", () => {
    const job = { id: 11, title: "Role", requirements: {} };
    render(<JobDetailsModal job={job} isOpen={true} onClose={() => {}} darkMode={false} onApply={() => {}} isApplied={true} />);
    const btn = screen.getByRole("button", { name: /already applied/i });
    expect(btn).toBeDisabled();
  });

  it("LandingNav contains sign-in and get started links", () => {
    render(<LandingNav darkMode={false} onToggleDarkMode={() => {}} />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
  });

  it("LandingPage CTA link exists", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: /get started free/i })).toBeInTheDocument();
  });

  it("CandidateNav highlights current page", () => {
    render(<CandidateNav darkMode={false} onToggleDarkMode={() => {}} userName="A" currentPage="interviews" />);
    expect(screen.getByRole("link", { name: /Interviews/i })).toBeInTheDocument();
  });

  it("Header renders null (legacy removed)", () => {
    const { container } = render(<Header darkMode={false} toggleDarkMode={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

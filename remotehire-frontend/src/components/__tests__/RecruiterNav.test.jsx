import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecruiterNav } from "../RecruiterNav";

describe("RecruiterNav Component", () => {
  const mockToggleDarkMode = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  it("renders navigation with RemoteHire logo", () => {
    render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John Recruiter"
        currentPage="dashboard"
      />
    );

    expect(screen.getByText("RemoteHire.io")).toBeInTheDocument();
  });

  it("displays recruiter name in profile section", () => {
    render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="Jane Smith"
        currentPage="candidates"
      />
    );

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("highlights current active page", () => {
    const { rerender } = render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="candidates"
      />
    );

    const candidatesLink = screen.getByText("Candidates").closest("a");
    expect(candidatesLink).toHaveClass("bg-blue-100");

    rerender(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="interviews"
      />
    );

    const interviewsLink = screen.getByText("Interviews").closest("a");
    expect(interviewsLink).toHaveClass("bg-blue-100");
  });

  it("renders all navigation links", () => {
    render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="dashboard"
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Job Posts")).toBeInTheDocument();
    expect(screen.getByText("Candidates")).toBeInTheDocument();
    expect(screen.getByText("Interviews")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("calls logout function when logout button is clicked", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify({ username: "test" }));

    render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="dashboard"
      />
    );

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await user.click(logoutButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
  });

  it("applies dark mode styles when darkMode is true", () => {
    const { container } = render(
      <RecruiterNav
        darkMode={true}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="dashboard"
      />
    );

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("bg-slate-800/80");
  });

  it("applies light mode styles when darkMode is false", () => {
    const { container } = render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="dashboard"
      />
    );

    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("bg-white/80");
  });

  it("calls onToggleDarkMode when dark mode toggle is clicked", async () => {
    const user = userEvent.setup();
    render(
      <RecruiterNav
        darkMode={false}
        onToggleDarkMode={mockToggleDarkMode}
        userName="John"
        currentPage="dashboard"
      />
    );

    const darkModeToggle = screen.getByRole("button", { name: /dark|light|mode/i });
    await user.click(darkModeToggle);

    expect(mockToggleDarkMode).toHaveBeenCalled();
  });
});

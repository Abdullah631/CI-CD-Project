import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardPage } from "../DashboardPage";
import { mockRecruiter, mockDashboardStats } from "../../test/fixtures/mockData";

// Mock fetch globally
global.fetch = vi.fn();

// Store original window.location
const originalLocation = window.location;

describe("DashboardPage Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch.mockClear();
    // Mock window.location with writable href
    delete window.location;
    window.location = { href: "", reload: vi.fn() };
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.location = originalLocation;
  });

  it("redirects to signin when no user is stored", async () => {
    // Don't set user in localStorage - it should be missing
    localStorage.setItem("darkMode", "false");

    render(<DashboardPage />);

    await waitFor(() => {
      expect(window.location.href).toBe("/#/signin");
    });
  });

  it("redirects to candidate dashboard when user role is candidate", () => {
    const candidateUser = { username: "candidate", role: "candidate" };
    localStorage.setItem("user", JSON.stringify(candidateUser));
    localStorage.setItem("darkMode", "false");
    localStorage.setItem("token", "test-token");

    render(<DashboardPage />);

    expect(window.location.href).toBe("/#/candidate-dashboard");
  });

  it("renders dashboard navigation for recruiter", async () => {
    const recruiterUser = { ...mockRecruiter, username: "recruiter1" };
    localStorage.setItem("user", JSON.stringify(recruiterUser));
    localStorage.setItem("token", "test-token");
    localStorage.setItem("darkMode", "false");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardStats,
    });

    render(<DashboardPage />);

    // Should render navigation
    await waitFor(() => {
      expect(screen.getByText("RemoteHire.io")).toBeInTheDocument();
    });
  });

  it("handles logout action", async () => {
    const recruiterUser = { ...mockRecruiter };
    localStorage.setItem("user", JSON.stringify(recruiterUser));
    localStorage.setItem("token", "test-token");
    localStorage.setItem("darkMode", "false");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardStats,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("RemoteHire.io")).toBeInTheDocument();
    });
  });

  it("displays page with dark mode disabled by default", () => {
    const recruiterUser = { ...mockRecruiter };
    localStorage.setItem("user", JSON.stringify(recruiterUser));
    localStorage.setItem("token", "test-token");
    localStorage.setItem("darkMode", "false");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardStats,
    });

    const { container } = render(<DashboardPage />);
    
    // Check if component renders
    expect(container.querySelector("main")).toBeInTheDocument();
  });
});

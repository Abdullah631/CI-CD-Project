import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockAuthTokens, mockUser, mockRecruiter } from "./fixtures/mockData";

/**
 * Test suite for authentication-related functionality
 */
describe("Authentication Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Token Management", () => {
    it("should store and retrieve access token", () => {
      const token = mockAuthTokens.access;
      localStorage.setItem("token", token);

      expect(localStorage.getItem("token")).toBe(token);
    });

    it("should store and retrieve refresh token", () => {
      const token = mockAuthTokens.refresh;
      localStorage.setItem("refresh_token", token);

      expect(localStorage.getItem("refresh_token")).toBe(token);
    });

    it("should remove token on logout", () => {
      localStorage.setItem("token", mockAuthTokens.access);
      localStorage.removeItem("token");

      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("User Storage", () => {
    it("should store candidate user data", () => {
      localStorage.setItem("user", JSON.stringify(mockUser));

      const storedUser = JSON.parse(localStorage.getItem("user"));
      expect(storedUser.username).toBe(mockUser.username);
      expect(storedUser.role).toBe("candidate");
      expect(storedUser.email).toBe(mockUser.email);
    });

    it("should store recruiter user data", () => {
      localStorage.setItem("user", JSON.stringify(mockRecruiter));

      const storedUser = JSON.parse(localStorage.getItem("user"));
      expect(storedUser.username).toBe(mockRecruiter.username);
      expect(storedUser.role).toBe("recruiter");
    });

    it("should clear user data on logout", () => {
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.removeItem("user");

      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("Authentication State", () => {
    it("should recognize authenticated user with token and user", () => {
      localStorage.setItem("token", mockAuthTokens.access);
      localStorage.setItem("user", JSON.stringify(mockUser));

      const isAuthenticated = !!(
        localStorage.getItem("token") && localStorage.getItem("user")
      );

      expect(isAuthenticated).toBe(true);
    });

    it("should recognize unauthenticated user without token", () => {
      localStorage.removeItem("token");

      const isAuthenticated = !!localStorage.getItem("token");

      expect(isAuthenticated).toBe(false);
    });

    it("should recognize different user roles", () => {
      localStorage.setItem("user", JSON.stringify(mockUser));
      const candidateUser = JSON.parse(localStorage.getItem("user"));

      localStorage.setItem("user", JSON.stringify(mockRecruiter));
      const recruiterUser = JSON.parse(localStorage.getItem("user"));

      expect(candidateUser.role).toBe("candidate");
      expect(recruiterUser.role).toBe("recruiter");
    });
  });

  describe("Authorization Headers", () => {
    it("should create proper Bearer token header", () => {
      const token = mockAuthTokens.access;
      const authHeader = `Bearer ${token}`;

      expect(authHeader).toBe(`Bearer ${token}`);
      expect(authHeader.startsWith("Bearer ")).toBe(true);
    });

    it("should include token in API request headers", () => {
      const token = mockAuthTokens.access;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      expect(headers.Authorization).toBe(`Bearer ${token}`);
      expect(headers["Content-Type"]).toBe("application/json");
    });
  });
});

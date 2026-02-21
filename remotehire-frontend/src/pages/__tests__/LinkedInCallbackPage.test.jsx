import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import { LinkedInCallbackPage } from "../LinkedInCallbackPage";

describe("LinkedInCallbackPage", () => {
  it("stores user and token on successful callback", async () => {
    window.history.pushState({}, "", "/?code=linkcode");
    const mock = vi.spyOn(axios, "post");
    mock.mockResolvedValue({
      status: 200,
      data: {
        username: "linkedin-user",
        role: "candidate",
        email: "li@example.com",
        token: "li-token",
      },
    });

    render(<LinkedInCallbackPage />);

    await waitFor(() => {
      expect(window.localStorage.getItem("token")).toBe("li-token");
      const user = JSON.parse(window.localStorage.getItem("user"));
      expect(user.username).toBe("linkedin-user");
    });

    mock.mockRestore();
  });
});

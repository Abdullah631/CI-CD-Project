import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import { GitHubCallbackPage } from "../GitHubCallbackPage";

describe("GitHubCallbackPage", () => {
  it("stores user and token on successful callback", async () => {
    window.history.pushState({}, "", "/?code=testcode");
    const mock = vi.spyOn(axios, "post");
    mock.mockResolvedValue({
      status: 200,
      data: {
        username: "octocat",
        role: "candidate",
        email: "octo@example.com",
        token: "gh-token",
      },
    });

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(window.localStorage.getItem("token")).toBe("gh-token");
      const user = JSON.parse(window.localStorage.getItem("user"));
      expect(user.username).toBe("octocat");
    });

    mock.mockRestore();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { CandidateDetailsPage } from "../CandidateDetailsPage";

describe("CandidateDetailsPage", () => {
  it("renders candidate name when API resolves", async () => {
    window.localStorage.setItem("token", "test-token");
    window.location.hash = "#/candidate/123";

    const mock = vi.spyOn(axios, "get");
    mock.mockResolvedValue({
      data: {
        candidate_name: "John Doe",
        candidate_email: "john@example.com",
        cv_url: null,
        cv_metadata: {},
      },
    });

    render(<CandidateDetailsPage />);
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    mock.mockRestore();
  });
});

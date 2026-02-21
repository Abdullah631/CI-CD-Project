import { render, screen } from "@testing-library/react";
import { CandidateDashboardPage } from "../CandidateDashboardPage";

describe("CandidateDashboardPage", () => {
  it("renders dashboard title without crashing", () => {
    window.localStorage.setItem(
      "user",
      JSON.stringify({ username: "Tester", role: "candidate" })
    );
    window.localStorage.setItem("token", "test-token");

    render(<CandidateDashboardPage />);
    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
  });
});

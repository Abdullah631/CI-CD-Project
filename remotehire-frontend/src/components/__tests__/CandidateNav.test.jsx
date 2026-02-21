import { render, screen } from "@testing-library/react";
import { CandidateNav } from "../../components/CandidateNav";

describe("CandidateNav", () => {
  it("renders brand and user name", () => {
    render(
      <CandidateNav
        darkMode={false}
        onToggleDarkMode={() => {}}
        userName="Alice"
        currentPage="dashboard"
      />
    );
    expect(screen.getByText(/RemoteHire.io/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/ })).toBeInTheDocument();
  });
});

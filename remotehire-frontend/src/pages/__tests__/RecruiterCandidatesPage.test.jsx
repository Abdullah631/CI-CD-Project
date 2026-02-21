import { render } from "@testing-library/react";
import RecruiterCandidatesPage from "../../pages/RecruiterCandidatesPage.jsx";

describe("RecruiterCandidatesPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<RecruiterCandidatesPage />);
    expect(container).toBeTruthy();
  });
});

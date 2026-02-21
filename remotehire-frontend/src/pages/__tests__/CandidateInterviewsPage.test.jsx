import { render } from "@testing-library/react";
import CandidateInterviewsPage from "../../pages/CandidateInterviewsPage.jsx";

describe("CandidateInterviewsPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<CandidateInterviewsPage />);
    expect(container).toBeTruthy();
  });
});

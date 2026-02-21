import { render } from "@testing-library/react";
import RecruiterInterviewsPage from "../../pages/RecruiterInterviewsPage.jsx";

describe("RecruiterInterviewsPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<RecruiterInterviewsPage />);
    expect(container).toBeTruthy();
  });
});

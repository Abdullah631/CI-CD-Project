import { render } from "@testing-library/react";
import RecruiterAnalyticsPage from "../../pages/RecruiterAnalyticsPage.jsx";

describe("RecruiterAnalyticsPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<RecruiterAnalyticsPage />);
    expect(container).toBeTruthy();
  });
});

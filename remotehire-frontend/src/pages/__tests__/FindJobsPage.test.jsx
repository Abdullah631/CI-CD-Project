import { render } from "@testing-library/react";
import FindJobsPage from "../../pages/FindJobsPage.jsx";

describe("FindJobsPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<FindJobsPage />);
    expect(container).toBeTruthy();
  });
});

import { render } from "@testing-library/react";
import JobPostsPage from "../../pages/JobPostsPage.jsx";

describe("JobPostsPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<JobPostsPage />);
    expect(container).toBeTruthy();
  });
});

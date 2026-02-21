import { render } from "@testing-library/react";
import ProfilePage from "../../pages/ProfilePage.jsx";

describe("ProfilePage", () => {
  it("renders without crashing", () => {
    const { container } = render(<ProfilePage />);
    expect(container).toBeTruthy();
  });
});

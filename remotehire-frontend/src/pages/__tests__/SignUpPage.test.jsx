import { render } from "@testing-library/react";
import SignUpPage from "../../pages/SignUpPage.jsx";

describe("SignUpPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<SignUpPage />);
    expect(container).toBeTruthy();
  });
});

import { render } from "@testing-library/react";
import ResetPasswordPage from "../../pages/ResetPasswordPage.jsx";

describe("ResetPasswordPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<ResetPasswordPage />);
    expect(container).toBeTruthy();
  });
});

import { render } from "@testing-library/react";
import ForgotPasswordPage from "../../pages/ForgotPasswordPage.jsx";

describe("ForgotPasswordPage", () => {
  it("renders without crashing", () => {
    const { container } = render(<ForgotPasswordPage />);
    expect(container).toBeTruthy();
  });
});

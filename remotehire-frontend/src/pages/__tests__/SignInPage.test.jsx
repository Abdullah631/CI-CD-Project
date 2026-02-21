import { render } from "@testing-library/react";
import SignInPage from "../../pages/SignInPage.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

describe("SignInPage", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <GoogleOAuthProvider clientId="test-client-id">
        <SignInPage />
      </GoogleOAuthProvider>
    );
    expect(container).toBeTruthy();
  });
});

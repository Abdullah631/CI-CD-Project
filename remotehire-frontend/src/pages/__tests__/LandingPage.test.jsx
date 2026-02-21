import { render, screen } from "@testing-library/react";
import { LandingPage } from "../../pages/LandingPage";

describe("LandingPage", () => {
  it("renders hero title and CTA", () => {
    render(<LandingPage />);
    expect(screen.getByText(/AI Intelligence/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get Started Free/i })).toBeInTheDocument();
  });
});

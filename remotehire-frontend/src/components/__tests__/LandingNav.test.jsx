import { render, screen, fireEvent } from "@testing-library/react";
import { LandingNav } from "../../components/LandingNav";

describe("LandingNav", () => {
  it("renders brand and actions", () => {
    const onToggle = vi.fn();
    render(<LandingNav darkMode={false} onToggleDarkMode={onToggle} />);
    expect(screen.getByText(/RemoteHire.io/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
  });

  it("calls toggle when clicking dark mode button", () => {
    const onToggle = vi.fn();
    render(<LandingNav darkMode={false} onToggleDarkMode={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle dark mode/i }));
    expect(onToggle).toHaveBeenCalled();
  });
});

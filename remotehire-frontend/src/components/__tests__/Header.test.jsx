import { render } from "@testing-library/react";
import { Header } from "../../components/Header";

describe("Header (deprecated)", () => {
  it("renders null without crashing", () => {
    const { container } = render(<Header darkMode={false} toggleDarkMode={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

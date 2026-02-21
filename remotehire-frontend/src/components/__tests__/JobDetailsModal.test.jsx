import { render, screen, fireEvent } from "@testing-library/react";
import JobDetailsModal from "../../components/JobDetailsModal";

const sampleJob = {
  id: 1,
  title: "Senior Developer",
  description: "Build amazing things",
  posted_by: "Acme Inc",
  status: "Active",
  requirements: {
    required_experience_years: 3,
    required_education: "Bachelor's",
    required_skills: ["React", "Node"],
    required_languages: ["English"],
    required_certifications: ["AWS"]
  }
};

describe("JobDetailsModal", () => {
  it("renders when open and shows title", () => {
    const onClose = vi.fn();
    const onApply = vi.fn();
    render(
      <JobDetailsModal
        job={sampleJob}
        isOpen={true}
        onClose={onClose}
        darkMode={false}
        onApply={onApply}
        isApplied={false}
      />
    );
    expect(screen.getByText(/Senior Developer/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply now/i })).toBeInTheDocument();
  });

  it("calls onApply and onClose when applying", () => {
    const onClose = vi.fn();
    const onApply = vi.fn();
    render(
      <JobDetailsModal
        job={sampleJob}
        isOpen={true}
        onClose={onClose}
        darkMode={false}
        onApply={onApply}
        isApplied={false}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /apply now/i }));
    expect(onApply).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });
});

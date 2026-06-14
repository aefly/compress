import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DropZone } from "../drop-zone";

function createMockFile(
  name: string = "test.jpg",
  type: string = "image/jpeg"
): File {
  return new File(["content"], name, { type });
}

describe("DropZone", () => {
  const defaultProps = {
    onFiles: vi.fn(),
    fileCount: 0,
  };

  it("renders the drop zone", () => {
    render(<DropZone {...defaultProps} />);
    expect(screen.getByText("Drag & drop images here")).toBeInTheDocument();
    expect(screen.getByText("click to browse")).toBeInTheDocument();
  });

  it("shows remaining file count", () => {
    render(<DropZone {...defaultProps} fileCount={3} />);
    expect(screen.getByText("Up to 7 more files")).toBeInTheDocument();
  });

  it("does not render when at max files", () => {
    const { container } = render(<DropZone {...defaultProps} fileCount={10} />);
    expect(container.firstChild).toBeNull();
  });

  it("calls onFiles when files are dropped", () => {
    const onFiles = vi.fn();
    render(<DropZone {...defaultProps} onFiles={onFiles} />);

    const dropZone = screen.getByText("Drag & drop images here").closest("div")!;
    const file = createMockFile();
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { files: [file] },
    });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });

    fireEvent(dropZone, dropEvent);
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("shows drag over state", () => {
    render(<DropZone {...defaultProps} />);
    const dropZone = screen.getByText("Drag & drop images here").closest("div")!;

    fireEvent.dragOver(dropZone);
    expect(screen.getByText("Drop images here")).toBeInTheDocument();
  });

  it("opens file picker when clicking browse", () => {
    render(<DropZone {...defaultProps} />);
    const browseButton = screen.getByText("click to browse");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.fn();
    input.click = clickSpy;

    fireEvent.click(browseButton);
    expect(clickSpy).toHaveBeenCalled();
  });
});

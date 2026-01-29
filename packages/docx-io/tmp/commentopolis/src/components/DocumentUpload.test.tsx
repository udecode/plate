import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentUpload } from './DocumentUpload';
import { DocumentProvider } from '../contexts/DocumentContext';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DocumentProvider>
    {children}
  </DocumentProvider>
);

describe('DocumentUpload', () => {
  it('renders upload area with correct text', () => {
    render(
      <TestWrapper>
        <DocumentUpload />
      </TestWrapper>
    );

    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('Only .docx files are supported')).toBeInTheDocument();
  });

  it('renders file input with correct attributes', () => {
    render(
      <TestWrapper>
        <DocumentUpload />
      </TestWrapper>
    );

    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.docx');
    expect(fileInput).toHaveAttribute('multiple');
    expect(fileInput).toHaveClass('hidden');
  });

  it('opens file dialog when upload area is clicked', () => {
    render(
      <TestWrapper>
        <DocumentUpload />
      </TestWrapper>
    );

    const uploadArea = screen.getByText('Click to upload').closest('div')?.parentElement;
    const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;
    
    // Mock click method
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    
    fireEvent.click(uploadArea!);
    expect(clickSpy).toHaveBeenCalled();
    
    clickSpy.mockRestore();
  });

  it('applies correct drag over styling', () => {
    render(
      <TestWrapper>
        <DocumentUpload />
      </TestWrapper>
    );

    const uploadArea = screen.getByText('Click to upload').closest('div')?.parentElement;
    
    // Test drag over
    fireEvent.dragOver(uploadArea!, {
      dataTransfer: { files: [] }
    });
    
    expect(uploadArea).toHaveClass('border-blue-400', 'bg-blue-50');
  });
});
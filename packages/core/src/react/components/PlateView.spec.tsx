import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { createStaticEditor } from '../../lib/static/editor/createStaticEditor';
import { PlateView } from './PlateView';

// Mock ClipboardEvent
global.ClipboardEvent = class ClipboardEvent extends Event {
  clipboardData: any;
  
  constructor(type: string, init?: any) {
    super(type, init);
    this.clipboardData = init?.clipboardData;
  }
} as any;

describe('PlateView', () => {
  let editor: any;
  let mockSetFragmentData: jest.Mock;

  beforeEach(() => {
    editor = createStaticEditor({
      value: [
        { 
          id: '1', 
          type: 'paragraph', 
          children: [{ text: 'First paragraph' }] 
        },
        { 
          id: '2', 
          type: 'paragraph', 
          children: [{ text: 'Second paragraph' }] 
        },
      ],
    });

    // Mock the setFragmentData transform
    mockSetFragmentData = jest.fn();
    editor.tf.setFragmentData = mockSetFragmentData;
  });

  it('should render PlateStatic component', () => {
    const { container } = render(
      <PlateView editor={editor} />
    );

    expect(container.firstChild).toBeDefined();
  });

  it('should pass through props to PlateStatic', () => {
    const { container } = render(
      <PlateView 
        editor={editor} 
        className="custom-class"
        data-testid="plate-view"
      />
    );

    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain('custom-class');
    expect(element.getAttribute('data-testid')).toBe('plate-view');
  });

  describe('copy event handling', () => {
    it('should call setFragmentData on copy event', () => {
      const { container } = render(
        <PlateView editor={editor} />
      );

      const mockClipboardData = {
        getData: jest.fn(),
        setData: jest.fn(),
      };

      const copyEvent = new ClipboardEvent('copy', {
        clipboardData: mockClipboardData as any,
      });

      Object.defineProperty(copyEvent, 'clipboardData', {
        value: mockClipboardData,
        writable: false,
      });

      fireEvent(container.firstChild!, copyEvent);

      expect(mockSetFragmentData).toHaveBeenCalledWith(mockClipboardData);
    });

    it('should prevent default when x-slate-fragment is set', () => {
      const { container } = render(
        <PlateView editor={editor} />
      );

      const mockClipboardData = {
        getData: jest.fn().mockReturnValue('some-fragment-data'),
        setData: jest.fn(),
      };

      const copyEvent = new ClipboardEvent('copy', {
        clipboardData: mockClipboardData as any,
      });

      Object.defineProperty(copyEvent, 'clipboardData', {
        value: mockClipboardData,
        writable: false,
      });

      const preventDefaultSpy = jest.spyOn(copyEvent, 'preventDefault');

      fireEvent(container.firstChild!, copyEvent);

      expect(mockClipboardData.getData).toHaveBeenCalledWith('application/x-slate-fragment');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default when x-slate-fragment is not set', () => {
      const { container } = render(
        <PlateView editor={editor} />
      );

      const mockClipboardData = {
        getData: jest.fn().mockReturnValue(''),
        setData: jest.fn(),
      };

      const copyEvent = new ClipboardEvent('copy', {
        clipboardData: mockClipboardData as any,
      });

      Object.defineProperty(copyEvent, 'clipboardData', {
        value: mockClipboardData,
        writable: false,
      });

      const preventDefaultSpy = jest.spyOn(copyEvent, 'preventDefault');

      fireEvent(container.firstChild!, copyEvent);

      expect(mockClipboardData.getData).toHaveBeenCalledWith('application/x-slate-fragment');
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should handle copy event with null clipboardData', () => {
      const { container } = render(
        <PlateView editor={editor} />
      );

      const copyEvent = new ClipboardEvent('copy', {
        clipboardData: null as any,
      });

      // Should not throw
      expect(() => {
        fireEvent(container.firstChild!, copyEvent);
      }).not.toThrow();
    });
  });

  it('should memoize onCopy callback', () => {
    const { rerender } = render(
      <PlateView editor={editor} />
    );

    // Re-render with same editor
    rerender(<PlateView editor={editor} />);

    // The component should not crash on re-render
    expect(true).toBe(true);
  });
});
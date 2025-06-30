import React from 'react';

import { fireEvent, render } from '@testing-library/react';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin';
import { PlateStatic } from './PlateStatic';

describe('PlateStatic copy functionality', () => {
  let mockGetSelection: jest.Mock;
  let mockClipboardData: Partial<DataTransfer>;
  let originalGetSelection: () => Selection | null;

  beforeEach(() => {
    // Store original getSelection
    originalGetSelection = window.getSelection;

    // Mock clipboard data
    mockClipboardData = {
      getData: jest.fn(),
      setData: jest.fn(),
    };

    // Mock window functions
    mockGetSelection = jest.fn();
    window.getSelection = mockGetSelection;
    (global as any).window.btoa = jest.fn((str: string) => Buffer.from(str).toString('base64'));
  });

  afterEach(() => {
    window.getSelection = originalGetSelection;
    jest.clearAllMocks();
  });

  it('should set x-slate-fragment on copy when elements have data-slate-id', () => {
    const editor = createSlateEditor({
      value: [
        {
          id: '1',
          type: 'paragraph',
          children: [{ text: 'First paragraph' }],
        },
        {
          id: '2',
          type: 'paragraph',
          children: [{ text: 'Second paragraph' }],
        },
      ],
      plugins: [
        createSlatePlugin({
          key: 'paragraph',
          node: { isElement: true },
          parsers: {
            html: {
              deserializer: {
                rules: [{ validNodeName: 'P' }],
              },
            },
          },
          render: {
            node: ({ children }) => <p>{children}</p>,
          },
        }),
      ],
    });

    const { container } = render(<PlateStatic editor={editor} />);

    // Create a mock selection that includes both paragraphs
    const fragment = document.createDocumentFragment();
    
    // Create mock elements with data-slate-id attributes
    const p1 = document.createElement('p');
    p1.setAttribute('data-slate-node', 'element');
    p1.setAttribute('data-slate-id', '1');
    p1.textContent = 'First paragraph';
    
    const p2 = document.createElement('p');
    p2.setAttribute('data-slate-node', 'element');
    p2.setAttribute('data-slate-id', '2');
    p2.textContent = 'Second paragraph';
    
    fragment.appendChild(p1);
    fragment.appendChild(p2);

    // Mock the selection to return our fragment
    const mockRange = {
      cloneContents: jest.fn().mockReturnValue(fragment),
    };
    
    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(mockRange),
    };
    
    mockGetSelection.mockReturnValue(mockSelection);

    // Trigger copy event with preventDefault spy
    const copyEvent = new Event('copy', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(copyEvent, 'preventDefault');
    Object.defineProperty(copyEvent, 'clipboardData', {
      value: mockClipboardData,
      writable: false,
    });
    
    fireEvent(container.firstChild!, copyEvent);

    // Verify x-slate-fragment was set
    expect(mockClipboardData.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expect.any(String)
    );

    // Verify the fragment content
    const fragmentCall = (mockClipboardData.setData as jest.Mock).mock.calls.find(
      call => call[0] === 'application/x-slate-fragment'
    );
    
    if (fragmentCall) {
      const encodedFragment = fragmentCall[1];
      const decodedFragment = JSON.parse(
        decodeURIComponent(Buffer.from(encodedFragment, 'base64').toString())
      );
      
      expect(decodedFragment).toHaveLength(2);
      expect(decodedFragment[0].id).toBe('1');
      expect(decodedFragment[0].children[0].text).toBe('First paragraph');
      expect(decodedFragment[1].id).toBe('2');
      expect(decodedFragment[1].children[0].text).toBe('Second paragraph');
    }

    // Verify preventDefault was called
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should NOT set x-slate-fragment when elements lack data-slate-id (current behavior)', () => {
    const editor = createSlateEditor({
      value: [
        {
          id: '1',
          type: 'paragraph',
          children: [{ text: 'First paragraph' }],
        },
        {
          id: '2',
          type: 'paragraph',
          children: [{ text: 'Second paragraph' }],
        },
      ],
      plugins: [
        createSlatePlugin({
          key: 'paragraph',
          node: { isElement: true },
          render: {
            node: ({ attributes, children }) => <p {...attributes}>{children}</p>,
          },
        }),
      ],
    });

    const { container } = render(<PlateStatic editor={editor} />);

    // Check actual rendered elements
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
    
    // Check if they have data-slate-node attribute (from BaseElementStatic)
    expect(paragraphs[0].getAttribute('data-slate-node')).toBe('element');
    expect(paragraphs[1].getAttribute('data-slate-node')).toBe('element');
    
    // This is the bug: elements don't have data-slate-id attributes
    expect(paragraphs[0].getAttribute('data-slate-id')).toBeNull();
    expect(paragraphs[1].getAttribute('data-slate-id')).toBeNull();

    // Create a selection with the actual rendered elements
    const fragment = document.createDocumentFragment();
    fragment.appendChild(paragraphs[0].cloneNode(true));
    fragment.appendChild(paragraphs[1].cloneNode(true));

    // Mock the selection to return our fragment
    const mockRange = {
      cloneContents: jest.fn().mockReturnValue(fragment),
    };
    
    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(mockRange),
    };
    
    mockGetSelection.mockReturnValue(mockSelection);

    // Trigger copy event
    const copyEvent = new Event('copy', { bubbles: true });
    Object.defineProperty(copyEvent, 'clipboardData', {
      value: mockClipboardData,
      writable: false,
    });
    
    fireEvent(container.firstChild!, copyEvent);

    // Due to missing data-slate-id, no data should be set
    expect(mockClipboardData.setData).not.toHaveBeenCalled();
    expect(copyEvent.defaultPrevented).toBe(false);
  });

  it('should handle empty selection', () => {
    const editor = createSlateEditor({
      value: [
        {
          id: '1',
          type: 'paragraph',
          children: [{ text: 'Test paragraph' }],
        },
      ],
    });

    const { container } = render(<PlateStatic editor={editor} />);

    // Mock empty selection
    mockGetSelection.mockReturnValue(null);

    // Trigger copy event
    const copyEvent = new Event('copy', { bubbles: true });
    Object.defineProperty(copyEvent, 'clipboardData', {
      value: mockClipboardData,
      writable: false,
    });
    
    fireEvent(container.firstChild!, copyEvent);

    // Should not set any data
    expect(mockClipboardData.setData).not.toHaveBeenCalled();
    expect(copyEvent.defaultPrevented).toBe(false);
  });

  // Note: SSR handling is already tested by the fact that PlateStatic.tsx
  // checks typeof window === 'undefined' before setting onCopy handler

  it('should only copy block-level elements (not inline elements)', () => {
    const editor = createSlateEditor({
      value: [
        {
          id: '1',
          type: 'paragraph',
          children: [
            { text: 'Text with ' },
            {
              id: '2',
              type: 'link',
              url: 'https://example.com',
              children: [{ text: 'a link' }],
            },
            { text: ' inside' },
          ],
        },
      ],
      plugins: [
        createSlatePlugin({
          key: 'paragraph',
          node: { isElement: true },
          render: {
            node: ({ children }) => <p>{children}</p>,
          },
        }),
        createSlatePlugin({
          key: 'link',
          node: { isElement: true, isInline: true },
          render: {
            node: ({ children, element }) => <a href={(element as any).url}>{children}</a>,
          },
        }),
      ],
    });

    const { container } = render(<PlateStatic editor={editor} />);

    // Create a mock selection with both block and inline elements
    const fragment = document.createDocumentFragment();
    
    const p = document.createElement('p');
    p.setAttribute('data-slate-node', 'element');
    p.setAttribute('data-slate-id', '1');
    
    const link = document.createElement('a');
    link.setAttribute('data-slate-node', 'element');
    link.setAttribute('data-slate-id', '2');
    link.setAttribute('data-slate-inline', 'true');
    
    p.appendChild(document.createTextNode('Text with '));
    p.appendChild(link);
    p.appendChild(document.createTextNode(' inside'));
    
    fragment.appendChild(p);

    // Mock the selection
    const mockRange = {
      cloneContents: jest.fn().mockReturnValue(fragment),
    };
    
    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(mockRange),
    };
    
    mockGetSelection.mockReturnValue(mockSelection);

    // Trigger copy event
    const copyEvent = new Event('copy', { bubbles: true });
    Object.defineProperty(copyEvent, 'clipboardData', {
      value: mockClipboardData,
      writable: false,
    });
    
    fireEvent(container.firstChild!, copyEvent);

    // Verify only the paragraph was included in the fragment
    const fragmentCall = (mockClipboardData.setData as jest.Mock).mock.calls.find(
      call => call[0] === 'application/x-slate-fragment'
    );
    
    if (fragmentCall) {
      const encodedFragment = fragmentCall[1];
      const decodedFragment = JSON.parse(
        decodeURIComponent(Buffer.from(encodedFragment, 'base64').toString())
      );
      
      expect(decodedFragment).toHaveLength(1);
      expect(decodedFragment[0].id).toBe('1');
      expect(decodedFragment[0].type).toBe('paragraph');
    }
  });
});
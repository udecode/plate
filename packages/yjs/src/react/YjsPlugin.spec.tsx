import React from 'react';

import { renderHook, waitFor } from '@testing-library/react';

import { createPlateEditor, Plate, useEditorSelection } from '@platejs/core/react';
import { YjsPlugin } from './YjsPlugin';

// Mock crypto.subtle.digest for tests
if (typeof window !== 'undefined' && !window.crypto?.subtle?.digest) {
  Object.defineProperty(window, 'crypto', {
    value: {
      subtle: {
        digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      },
    },
  });
}

describe('YjsPlugin - useEditorSelection issue', () => {
  it('should demonstrate that useEditorSelection returns null with YjsPlugin', async () => {
    const editor = createPlateEditor({
      plugins: [
        YjsPlugin.configure({
          options: {
            providers: [
              {
                type: 'mock' as any,
                options: {} as any,
              },
            ],
          },
        }),
      ],
      skipInitialization: true,
      value: [{ type: 'p', children: [{ text: 'test' }] }],
    });

    let hookResult: any;

    const TestComponent = () => {
      const selection = useEditorSelection();
      hookResult = selection;
      return null;
    };

    const wrapper = ({ children }: any) => (
      <Plate editor={editor}>
        <TestComponent />
        {children}
      </Plate>
    );

    renderHook(() => {}, { wrapper });

    // Initialize YjsPlugin after render
    await editor.getApi(YjsPlugin).yjs.init();

    // Wait for effect
    await waitFor(() => {
      // This demonstrates the issue - selection returns null with YjsPlugin
      expect(hookResult).toBeNull();
    });

    // The expected behavior would be for selection to not be null
    // but to have a value like:
    // {
    //   anchor: { path: [0, 0], offset: 0 },
    //   focus: { path: [0, 0], offset: 0 },
    // }
  });

  it('should demonstrate that selection changes are not tracked with YjsPlugin', async () => {
    const editor = createPlateEditor({
      plugins: [
        YjsPlugin.configure({
          options: {
            providers: [
              {
                type: 'mock' as any,
                options: {} as any,
              },
            ],
          },
        }),
      ],
      skipInitialization: true,
      value: [{ type: 'p', children: [{ text: 'Hello world' }] }],
    });

    let selectionResult: any;

    const TestComponent = () => {
      const selection = useEditorSelection();
      selectionResult = selection;
      return null;
    };

    const wrapper = ({ children }: any) => (
      <Plate editor={editor}>
        <TestComponent />
        {children}
      </Plate>
    );

    renderHook(() => {}, { wrapper });

    // Initialize YjsPlugin after render
    await editor.getApi(YjsPlugin).yjs.init();

    // Wait for initial state
    await waitFor(() => {
      expect(selectionResult).toBeNull();
    });

    // Try to change selection
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });

    // Wait a bit for any potential updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Selection still remains null - demonstrating the issue
    expect(selectionResult).toBeNull();

    // The expected behavior would be for selection to update to:
    // {
    //   anchor: { path: [0, 0], offset: 0 },
    //   focus: { path: [0, 0], offset: 5 },
    // }
  });
});
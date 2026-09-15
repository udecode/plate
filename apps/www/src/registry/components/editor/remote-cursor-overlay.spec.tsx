import { describe, expect, it } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import { BaseParagraphPlugin } from 'platejs';
import { createEditor, EditorRoot, EditorContent } from 'platejs/react';
import type { YjsAwarenessChange, YjsAwarenessState } from 'platejs/yjs';
import React from 'react';
import * as Y from 'yjs';

import { CollaborationPlugin } from './remote-cursor-overlay';

class TestAwareness {
  readonly doc: Y.Doc;

  private readonly listeners = new Set<(event: YjsAwarenessChange) => void>();
  private localState: YjsAwarenessState | null = null;
  private readonly states = new Map<number, YjsAwarenessState>();

  constructor(doc: Y.Doc) {
    this.doc = doc;
  }

  getLocalState = () => this.localState;
  getStates = () => this.states;

  off(_event: 'change', listener: (event: YjsAwarenessChange) => void) {
    this.listeners.delete(listener);
  }

  on(_event: 'change', listener: (event: YjsAwarenessChange) => void) {
    this.listeners.add(listener);
  }

  setLocalStateField(field: string, value: unknown) {
    this.localState = { ...this.localState, [field]: value };
    this.states.set(this.doc.clientID, this.localState);
    this.emit({ added: [], removed: [], updated: [this.doc.clientID] });
  }

  setRemoteState(clientId: number, state: YjsAwarenessState) {
    const added = this.states.has(clientId) ? [] : [clientId];

    this.states.set(clientId, state);
    this.emit({
      added,
      removed: [],
      updated: added.length === 0 ? [clientId] : [],
    });
  }

  private emit(event: YjsAwarenessChange) {
    for (const listener of this.listeners) listener(event);
  }
}

describe('copied remote selection presentation', () => {
  it('tracks metadata and selection through the configured Yjs source', async () => {
    const doc = new Y.Doc();
    const awareness = new TestAwareness(doc);

    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'alpha' }], type: 'paragraph' },
        { children: [{ text: 'beta' }], type: 'paragraph' },
      ],
      plugins: [
        BaseParagraphPlugin,
        CollaborationPlugin.create({
          awareness,
          doc,
          initialReady: true,
          seed: true,
        }),
      ],
      schema: { id: 'copied-yjs-presentation', version: 1 },
    });
    const view = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    const remoteSelection = () =>
      view.container.querySelector(
        '[data-remote-selection][data-client-id="202"]'
      );

    try {
      act(() => {
        editor.update.selection.set({
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        });
        editor.api.yjs.syncSelection();
        awareness.setRemoteState(202, {
          data: { color: '#123456', name: 'Ada' },
          selection: awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => {
        expect(remoteSelection()?.textContent).toBe('lp');
        expect(remoteSelection()?.getAttribute('style')).toContain('#12345633');
      });

      act(() => {
        awareness.setRemoteState(202, {
          data: { color: '#654321', name: 'Ada' },
          selection: awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => {
        expect(remoteSelection()?.getAttribute('style')).toContain('#65432133');
      });

      act(() => {
        editor.update.selection.set({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        });
        editor.api.yjs.syncSelection();
        awareness.setRemoteState(202, {
          data: { color: 'invalid', name: 'Ada' },
          selection: awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => {
        expect(remoteSelection()?.textContent).toBe('be');
        expect(remoteSelection()?.getAttribute('style')).toContain('#DB277733');
        expect(
          view.container.querySelectorAll('[data-remote-selection]')
        ).toHaveLength(1);
      });

      act(() => {
        editor.update.selection.set({
          anchor: { offset: 2, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        });
        editor.api.yjs.syncSelection();
        awareness.setRemoteState(202, {
          selection: awareness.getLocalState()?.selection,
        });
      });
      await waitFor(() => expect(remoteSelection()).toBeNull());
    } finally {
      view.unmount();
      doc.destroy();
    }
  });
});

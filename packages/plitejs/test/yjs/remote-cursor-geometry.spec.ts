import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { JSDOM } from 'jsdom';

import type { Range } from '../../src';
import { DOMEditor } from '../../src/dom';
import { DOMRootRuntime, EDITOR_TO_ELEMENT } from '../../src/dom/internal';
import {
  createYjsRemoteCursorGeometryOwner,
  getYjsCursorCache,
} from '../../src/yjs/react/useYjs';
import {
  createYjsPeer,
  FakeAwareness,
  paragraph,
  type Peer,
  runYjsUpdate,
} from './support/collaboration';

const selection = (offset: number): Range => ({
  anchor: { path: [0, 0], offset },
  focus: { path: [0, 0], offset },
});

const sendRemoteSelection = (
  peer: Peer,
  awareness: FakeAwareness,
  range: Range,
  clientId: number
) => {
  runYjsUpdate(peer, (yjs) => {
    yjs.sendSelection(range);
    awareness.setRemoteState(clientId, {
      selection: awareness.getLocalState()?.selection,
    });
  });
};

describe('Yjs remote cursor geometry', () => {
  it('reads the existing keyed cursor cache through the shared range owner', async () => {
    const dom = new JSDOM('<!doctype html><body></body>');
    const awareness = new FakeAwareness(2);
    const peer = createYjsPeer({
      awareness,
      children: [paragraph('alpha')],
      clientId: 'local',
      numericClientId: 2,
    });
    const root = dom.window.document.createElement('div');

    root.dataset.editor = 'true';
    root.textContent = 'alpha';
    dom.window.document.body.append(root);
    EDITOR_TO_ELEMENT.set(peer.editor, root);
    const runtime = new DOMRootRuntime({
      adapter: {},
      editor: peer.editor,
      getAndroidMutationHandler: () => null,
      isAndroidMutationOwned: () => false,
      isCanonicalTextMutation: () => true,
      isComposing: () => false,
      onRepair: () => {},
      resolvePath: () => null,
    });

    runtime.setRoot(root);
    runtime.connect();
    sendRemoteSelection(peer, awareness, selection(2), 101);
    const originalResolveDOMRange = DOMEditor.resolveDOMRange;
    let resolvedRanges = 0;

    DOMEditor.resolveDOMRange = (editor, range) => {
      const editable = EDITOR_TO_ELEMENT.get(editor);
      const text = editable?.firstChild;

      if (!text) return null;

      resolvedRanges += 1;
      const left = range.focus.offset * 10;

      return {
        endContainer: text,
        getBoundingClientRect: () => ({
          bottom: 30,
          height: 18,
          left,
          right: left + 1,
          top: 12,
          width: 1,
          x: left,
          y: 12,
        }),
        getClientRects: () => [],
        startContainer: text,
      } as unknown as globalThis.Range;
    };
    const geometry = createYjsRemoteCursorGeometryOwner(
      peer.editor,
      getYjsCursorCache(peer.editor),
      101,
      { current: root }
    );
    const release = geometry.activate();

    try {
      assert.equal(geometry.getSnapshot()?.boundingRect.left, 20);
      const initialResolutions = resolvedRanges;

      sendRemoteSelection(peer, awareness, selection(3), 102);
      assert.equal(runtime.domPhaseScheduler.pending(), 0);
      assert.equal(resolvedRanges, initialResolutions);

      sendRemoteSelection(peer, awareness, selection(4), 101);
      assert.equal(runtime.domPhaseScheduler.pending(), 1);
      runtime.domPhaseScheduler.flush();
      assert.equal(resolvedRanges, initialResolutions + 2);
      assert.equal(geometry.getSnapshot()?.boundingRect.left, 40);
    } finally {
      release();
      await Promise.resolve();
      DOMEditor.resolveDOMRange = originalResolveDOMRange;
      runtime.destroy();
      EDITOR_TO_ELEMENT.delete(peer.editor);
      peer.cleanup();
      dom.window.close();
    }
  });
});

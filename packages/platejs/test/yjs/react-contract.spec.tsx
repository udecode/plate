import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as Y from 'yjs';

import { FakeAwareness } from '../../../plitejs/test/yjs/support/provider';
import type { Range, Value } from '../../src/index';
import { BaseParagraphPlugin } from '../../src/index';
import { createEditor, EditorContent, EditorRoot } from '../../src/react/core';
import {
  YjsPlugin,
  useYjsAdmissionStatus,
  useYjsRemoteCursor,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from '../../src/yjs/react';

const shouldUnregisterHappyDOM = !GlobalRegistrator.isRegistered;

if (shouldUnregisterHappyDOM) {
  GlobalRegistrator.register();
}
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

after(() => {
  if (shouldUnregisterHappyDOM) {
    void GlobalRegistrator.unregister();
  }
});

type CursorData = Readonly<{
  color: string;
  name: string;
}>;

class DocumentAwareness extends FakeAwareness {
  override readonly doc: Y.Doc;

  constructor(doc: Y.Doc, clientId: number) {
    super(clientId);
    this.doc = doc;
  }
}

const initialValue = (): Value => [
  { children: [{ text: 'alpha' }], type: 'paragraph' },
  { children: [{ text: 'beta' }], type: 'paragraph' },
  { children: [{ text: 'gamma' }], type: 'paragraph' },
];

const selection = (
  path: Range['anchor']['path'] = [0, 0],
  offset = 1
): Range => ({
  anchor: { path, offset },
  focus: { path, offset: offset + 2 },
});

const isCursorData = (value: unknown): value is CursorData =>
  typeof value === 'object' &&
  value !== null &&
  'color' in value &&
  typeof value.color === 'string' &&
  'name' in value &&
  typeof value.name === 'string';

const createFixture = () => {
  const doc = new Y.Doc();
  const awareness = new DocumentAwareness(doc, doc.clientID);
  const Collaboration = YjsPlugin.create({
    awareness,
    cursorData: { validate: isCursorData },
    doc,
    initialReady: true,
    seed: true,
  });
  const editor = createEditor({
    initialValue: initialValue(),
    plugins: [BaseParagraphPlugin, Collaboration],
    schema: { id: 'plate:yjs-react-contract', version: 1 },
  });

  return { awareness, Collaboration, doc, editor };
};

type RenderedView = {
  readonly container: HTMLDivElement;
  readonly unmount: () => void;
};

const render = (element: React.ReactNode): RenderedView => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

describe('platejs/yjs React facade', () => {
  it('renders and moves remote selections from the factory decoration', () => {
    const { awareness, Collaboration, doc, editor } = createFixture();
    const AdmissionProbe = () => {
      const status = useYjsAdmissionStatus(editor);

      return <output data-admission={status.state} />;
    };
    const view = render(
      <EditorRoot editor={editor}>
        <AdmissionProbe />
        <EditorContent aria-label="Editor" />
      </EditorRoot>
    );
    const portal = editor.plugin(Collaboration);

    try {
      assert.equal(
        view.container
          .querySelector('[data-admission]')
          ?.getAttribute('data-admission'),
        'ready'
      );

      act(() => {
        editor.update.selection.set(selection([0, 0], 1));
        portal.api.setCursorData({ color: 'tomato', name: 'Ada' });
        portal.api.syncSelection();
        awareness.setRemoteState(
          202,
          awareness.getLocalState() ?? { data: null, selection: null }
        );
      });

      assert.equal(
        view.container.querySelector(
          '[data-remote-selection][data-client-id="202"]'
        )?.textContent,
        'lp'
      );

      act(() => {
        editor.update.selection.set(selection([1, 0], 0));
        portal.api.syncSelection();
        awareness.setRemoteState(
          202,
          awareness.getLocalState() ?? { data: null, selection: null }
        );
      });

      assert.equal(
        view.container.querySelector(
          '[data-remote-selection][data-client-id="202"]'
        )?.textContent,
        'be'
      );
    } finally {
      view.unmount();
      doc.destroy();
    }
  });

  it('keeps explicit-editor cursor hooks typed and keyed by client id', () => {
    const { awareness, Collaboration, doc, editor } = createFixture();
    const renders = new Map<number, number>();
    const Cursor = ({ clientId }: { readonly clientId: number }) => {
      const cursor = useYjsRemoteCursor(editor, clientId);
      const name: string | undefined = cursor?.data?.name;

      renders.set(clientId, (renders.get(clientId) ?? 0) + 1);

      return <output data-client-id={clientId}>{name ?? 'none'}</output>;
    };
    const CursorList = () => {
      const clientIds = useYjsRemoteCursorIds(editor);

      return clientIds.map((clientId) => (
        <Cursor clientId={clientId} key={clientId} />
      ));
    };
    const view = render(<CursorList />);
    const portal = editor.plugin(Collaboration);

    try {
      act(() => {
        editor.update.selection.set(selection([0, 0], 1));
        portal.api.setCursorData({ color: 'tomato', name: 'Ada' });
        portal.api.syncSelection();
        awareness.setRemoteState(
          202,
          awareness.getLocalState() ?? { data: null, selection: null }
        );

        editor.update.selection.set(selection([1, 0], 1));
        portal.api.setCursorData({ color: 'purple', name: 'Grace' });
        portal.api.syncSelection();
        awareness.setRemoteState(
          303,
          awareness.getLocalState() ?? { data: null, selection: null }
        );
      });

      const graceRenders = renders.get(303);

      act(() => {
        awareness.setRemoteState(202, {
          ...awareness.getStates().get(202),
          data: { color: 'red', name: 'Lin' },
        });
      });

      assert.equal(
        view.container.querySelector('[data-client-id="202"]')?.textContent,
        'Lin'
      );
      assert.equal(renders.get(303), graceRenders);
    } finally {
      view.unmount();
      doc.destroy();
    }
  });

  it('returns null geometry without the exact mounted editable', () => {
    const { awareness, Collaboration, doc, editor } = createFixture();
    const GeometryProbe = () => {
      const editableRef = React.useRef<HTMLDivElement>(null);
      const geometry = useYjsRemoteCursorGeometry(editor, 202, {
        editableRef,
      });

      return <output>{geometry ? 'measured' : 'none'}</output>;
    };
    const view = render(<GeometryProbe />);
    const portal = editor.plugin(Collaboration);

    try {
      act(() => {
        editor.update.selection.set(selection([1, 0], 1));
        portal.api.setCursorData({ color: 'tomato', name: 'Ada' });
        portal.api.syncSelection();
        awareness.setRemoteState(
          202,
          awareness.getLocalState() ?? { data: null, selection: null }
        );
      });

      assert.equal(view.container.textContent, 'none');
    } finally {
      view.unmount();
      doc.destroy();
    }
  });
});

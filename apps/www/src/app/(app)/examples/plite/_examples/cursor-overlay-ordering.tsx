'use client';

import { CursorOverlayPlugin } from '@platejs/cursor';
import type { TextSelection } from '@platejs/plite';
import {
  definePlatePlugin,
  ParagraphPlugin,
  Plate,
  PlateContent,
  useEditor,
  usePlateEditor,
  usePluginStore,
} from 'platejs/react';
import type { ReactNode } from 'react';

const selection = {
  kind: 'text',
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 5, path: [0, 0] },
} satisfies TextSelection;

const NestedEditableProbePlugin = definePlatePlugin('nestedEditableProbe', {
  render: {
    belowNodes: () =>
      function NestedEditableProbe({ children }: { children: ReactNode }) {
        return (
          <div className="rounded border p-3">
            <div
              aria-label="Nested cursor editor"
              className="min-h-16 outline-none"
              contentEditable
              data-test-id="nested-editable"
              onMouseUp={(event) => {
                event.currentTarget.focus();
              }}
              role="textbox"
              suppressContentEditableWarning
              tabIndex={0}
            >
              {children}
            </div>
          </div>
        );
      },
  },
});

const CursorState = () => {
  const editor = useEditor();
  const cursors = usePluginStore(CursorOverlayPlugin, 'cursors');

  return (
    <div className="flex items-center gap-3">
      <button
        className="rounded border px-3 py-2"
        onClick={() => {
          editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
            selection,
          });
        }}
        type="button"
      >
        Restore selection cursor
      </button>
      <output data-test-id="cursor-overlay-state">
        {cursors.selection ? 'present' : 'cleared'}
      </output>
    </div>
  );
};

const CursorOverlayOrderingExample = () => {
  const editor = usePlateEditor({
    plugins: [ParagraphPlugin, CursorOverlayPlugin, NestedEditableProbePlugin],
    initialValue: [
      { children: [{ text: 'Focus this nested editor.' }], type: 'paragraph' },
    ],
  });

  return (
    <Plate editor={editor}>
      <div className="flex flex-col gap-3">
        <CursorState />
        <PlateContent aria-label="Cursor overlay ordering editor" />
      </div>
    </Plate>
  );
};

export default CursorOverlayOrderingExample;

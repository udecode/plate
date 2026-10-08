'use client';

import { NodeApi } from 'platejs';
import {
  definePlugin,
  EditorContent,
  EditorRoot,
  ParagraphPlugin,
  type RenderNodeWrapperProps,
  useCreateEditor,
  useDropIndicator,
  useEditorValue,
} from 'platejs/react';
import * as React from 'react';

const FixtureDraggable = ({
  children,
  editor,
  element,
  renderPath,
}: RenderNodeWrapperProps) => (
  <div
    className="relative rounded border border-dashed p-2 pl-10 [&>[data-editor-dragging]]:opacity-50"
    data-dnd-editor={editor.id}
    data-dnd-path={renderPath.join('.')}
  >
    <button
      aria-label={`Drag ${editor.id} block ${renderPath.join('.')}`}
      className="absolute top-2 left-2 cursor-grab rounded border px-1"
      contentEditable={false}
      draggable
      type="button"
      onDragStart={(event) => {
        if (!editor.api.dom.drag.start(event.nativeEvent, { node: element })) {
          event.preventDefault();
        }
      }}
    >
      ⠿
    </button>
    {children}
  </div>
);

const FixtureDropIndicator = () => {
  const indicator = useDropIndicator();

  if (!indicator) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed h-0.5 bg-blue-500"
      data-dnd-indicator={indicator.edge}
      style={{
        left: indicator.line.x,
        top: indicator.line.y - 1,
        width: indicator.line.width,
      }}
    />
  );
};

const FixtureDndPlugin = definePlugin('fixtureDnd', {
  slots: {
    afterEditable: FixtureDropIndicator,
    wrapNode: {
      component: FixtureDraggable,
      match: ({ renderPath }) => renderPath.length === 1,
    },
  },
});

const EditorModel = ({ id }: { id: string }) => {
  const value = useEditorValue();

  return (
    <output className="sr-only" data-test-id={`${id}-model`}>
      {value.map(NodeApi.string).join('|')}
    </output>
  );
};

const DndEditor = ({
  id,
  label,
  texts,
  views = 1,
}: {
  id: string;
  label: string;
  texts: string[];
  views?: number;
}) => {
  const editor = useCreateEditor({
    id,
    plugins: [ParagraphPlugin, FixtureDndPlugin],
    initialValue: texts.map((text) => ({
      children: [{ text }],
      type: 'paragraph',
    })),
  });

  return Array.from({ length: views }, (_, view) => (
    <section key={view} data-test-id={`${id}-view-${view}`}>
      <EditorRoot editor={editor}>
        {view === 0 && <EditorModel id={id} />}
        <EditorContent
          aria-label={view === 0 ? label : `${label} view ${view + 1}`}
          className="grid min-h-24 gap-2 rounded border p-3 outline-none"
        />
      </EditorRoot>
    </section>
  ));
};

const PlateDndCrossEditorExample = () => (
  <div className="grid gap-4">
    <DndEditor
      id="plate-dnd-source"
      label="Plate DnD source editor"
      texts={['source', 'keep']}
    />
    <DndEditor
      id="plate-dnd-target"
      label="Plate DnD target editor"
      texts={['target']}
    />
    <DndEditor
      id="plate-dnd-bystander"
      label="Plate DnD bystander editor"
      texts={['bystander']}
    />
    <DndEditor
      id="plate-dnd-split"
      label="Plate DnD split editor"
      texts={['split', 'tail']}
      views={2}
    />
  </div>
);

export default PlateDndCrossEditorExample;

'use client';

import { DndPlugin, useDraggable } from '@platejs/dnd';
import { NodeApi } from '@platejs/plite';
import {
  ParagraphPlugin,
  Plate,
  PlateContent,
  type RenderNodeWrapperDescriptor,
  type RenderNodeWrapperProps,
  useEditorValue,
  usePlateEditor,
} from 'platejs/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const FixtureDraggable = ({
  children,
  editor,
  element,
  renderPath,
}: RenderNodeWrapperProps) => {
  const { handleRef, nodeRef } = useDraggable({ element });

  return (
    <div
      ref={nodeRef}
      className="relative rounded border border-dashed p-2 pl-10"
      data-dnd-editor={editor.id}
      data-dnd-path={renderPath.join('.')}
    >
      <button
        ref={handleRef}
        aria-label={`Drag ${editor.id} block ${renderPath.join('.')}`}
        className="absolute top-2 left-2 cursor-grab rounded border px-1"
        contentEditable={false}
        type="button"
      >
        ⠿
      </button>
      {children}
    </div>
  );
};

const fixtureDraggable = {
  component: FixtureDraggable,
  match: ({ renderPath }) => renderPath.length === 1,
} satisfies RenderNodeWrapperDescriptor<typeof DndPlugin>;

const FixtureDndPlugin = DndPlugin.configure({
  render: { aboveNodes: fixtureDraggable },
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
}: {
  id: string;
  label: string;
  texts: string[];
}) => {
  const editor = usePlateEditor({
    id,
    plugins: [ParagraphPlugin, FixtureDndPlugin],
    initialValue: texts.map((text) => ({
      children: [{ text }],
      type: 'paragraph',
    })),
  });

  return (
    <Plate editor={editor}>
      <EditorModel id={id} />
      <PlateContent
        aria-label={label}
        className="grid min-h-24 gap-2 rounded border p-3 outline-none"
      />
    </Plate>
  );
};

const PlateDndCrossEditorExample = () => (
  <DndProvider backend={HTML5Backend}>
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
    </div>
  </DndProvider>
);

export default PlateDndCrossEditorExample;

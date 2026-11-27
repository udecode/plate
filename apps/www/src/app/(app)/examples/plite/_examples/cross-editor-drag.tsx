'use client';

import { history } from 'plitejs/history';
import { EditorContent, EditorRoot, useCreateEditor } from 'plitejs/react';

const DragEditor = ({ label, text }: { label: string; text: string }) => {
  const editor = useCreateEditor({
    plugins: [history()],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text }],
      },
    ],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContent
        aria-label={label}
        className="min-h-20 rounded border p-3 outline-none"
      />
    </EditorRoot>
  );
};

const CrossEditorDragExample = () => (
  <div className="grid gap-4">
    <DragEditor label="Drag source editor" text="Alpha Bravo" />
    <DragEditor label="Drag target editor" text="Charlie" />
    <DragEditor label="Drag bystander editor" text="Echo" />
  </div>
);

export default CrossEditorDragExample;

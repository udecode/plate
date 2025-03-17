'use client';
import { useState } from 'react';

import {
  Plate,
  PlateContent,
  PlateController,
  useEditorRef,
  usePlateEditor,
} from '@udecode/plate/react';

import { Button } from '@/registry/default/plate-ui/button';

let nextId = 3;

export default function PlateControllerExamplePage() {
  const [editors, setEditors] = useState<number[]>([1, 2]);
  const addEditor = () => setEditors([...editors, nextId++]);

  const removeEditor = (idToRemove: number) =>
    setEditors(editors.filter((id) => id !== idToRemove));

  return (
    <PlateController>
      <ActiveEditor />

      <p>
        <Button onClick={addEditor}>Add editor</Button>
      </p>

      {editors.map((id) => (
        <Editor id={id} key={id} onRemove={() => removeEditor(id)} />
      ))}
    </PlateController>
  );
}

const ActiveEditor = () => {
  const { id } = useEditorRef();
  return (
    <p className="mb-2">
      The active editor is <span data-testid="active-editor">{id}</span>
    </p>
  );
};

const Editor = ({ id, onRemove }: { id: number; onRemove: VoidFunction }) => {
  const editor = usePlateEditor({ id: id.toString() });

  return (
    <div className="mt-5 space-y-2">
      <Plate editor={editor}>
        <PlateContent
          className="rounded-lg border p-3"
          placeholder={`Editor ${id}`}
        />
      </Plate>
      <p>
        <Button onClick={onRemove}>Remove editor {id}</Button>
      </p>
    </div>
  );
};

import { Editable, EditorRoot, useEditor } from 'plitejs/react';

const ReadOnlyExample = () => {
  const editor = useEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'This example shows what happens when the Editor is set to readOnly, it is not editable',
          },
        ],
      },
    ],
  });
  return (
    <EditorRoot editor={editor}>
      <Editable placeholder="Enter some plain text..." readOnly />
    </EditorRoot>
  );
};

export default ReadOnlyExample;

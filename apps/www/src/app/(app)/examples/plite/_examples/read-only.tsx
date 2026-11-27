import { EditorContent, EditorRoot, useCreateEditor } from 'plitejs/react';

const ReadOnlyExample = () => {
  const editor = useCreateEditor({
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
      <EditorContent placeholder="Enter some plain text..." readOnly />
    </EditorRoot>
  );
};

export default ReadOnlyExample;

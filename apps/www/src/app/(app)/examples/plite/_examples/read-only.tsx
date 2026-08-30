import { Editable, Plite, useEditor } from 'plitejs/react';

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
    <Plite editor={editor}>
      <Editable placeholder="Enter some plain text..." readOnly />
    </Plite>
  );
};

export default ReadOnlyExample;

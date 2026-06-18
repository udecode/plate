import { Editable, Slate, useSlateEditor } from '@platejs/slate-react';

const ReadOnlyExample = () => {
  const editor = useSlateEditor({
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
    <Slate editor={editor}>
      <Editable placeholder="Enter some plain text..." readOnly />
    </Slate>
  );
};

export default ReadOnlyExample;

import { Editable, Slate, useSlateEditor } from '@platejs/slate-react';

const PlainTextExample = () => {
  const editor = useSlateEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is editable plain text, just like a <textarea>!' },
        ],
      },
    ],
  });
  return (
    <Slate editor={editor}>
      <Editable placeholder="Enter some plain text..." />
    </Slate>
  );
};

export default PlainTextExample;

import { history } from 'plitejs/history';
import { Editable, Plite, useEditor } from 'plitejs/react';

const PlainTextExample = () => {
  const editor = useEditor({
    extensions: [history()],
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
    <Plite editor={editor}>
      <Editable placeholder="Enter some plain text..." />
    </Plite>
  );
};

export default PlainTextExample;

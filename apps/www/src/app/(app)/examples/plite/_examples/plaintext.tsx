import { history } from '@platejs/plite-history';
import { Editable, Plite, usePliteEditor } from '@platejs/plite-react';

const PlainTextExample = () => {
  const editor = usePliteEditor({
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

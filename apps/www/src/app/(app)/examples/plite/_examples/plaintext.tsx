import { history } from 'plitejs/history';
import { Editable, EditorRoot, useCreateEditor } from 'plitejs/react';

const PlainTextExample = () => {
  const editor = useCreateEditor({
    plugins: [history()],
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
    <EditorRoot editor={editor}>
      <Editable placeholder="Enter some plain text..." />
    </EditorRoot>
  );
};

export default PlainTextExample;

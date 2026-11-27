import { history } from 'plitejs/history';
import { EditorContent, EditorRoot, useCreateEditor } from 'plitejs/react';

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
      <EditorContent placeholder="Enter some plain text..." />
    </EditorRoot>
  );
};

export default PlainTextExample;

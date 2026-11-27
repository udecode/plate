import { history } from 'plitejs/history';
import {
  EditorContent,
  type RenderPlaceholderProps,
  EditorRoot,
  useCreateEditor,
} from 'plitejs/react';

const PlainTextExample = () => {
  const editor = useCreateEditor({
    plugins: [history()],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContent
        placeholder="Type something"
        renderPlaceholder={({
          children,
          attributes,
        }: RenderPlaceholderProps) => (
          <div {...attributes}>
            <p>{children}</p>
            <pre>
              Use the renderPlaceholder prop to customize rendering of the
              placeholder
            </pre>
          </div>
        )}
      />
    </EditorRoot>
  );
};

export default PlainTextExample;

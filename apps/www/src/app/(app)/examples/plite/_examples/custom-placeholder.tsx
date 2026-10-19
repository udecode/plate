import { history } from 'plitejs/history';
import {
  Editable,
  type RenderPlaceholderProps,
  EditorRoot,
  useEditor,
} from 'plitejs/react';

const PlainTextExample = () => {
  const editor = useEditor({
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
      <Editable
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

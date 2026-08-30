import { history } from 'plitejs/history';
import {
  Editable,
  type RenderPlaceholderProps,
  Plite,
  useEditor,
} from 'plitejs/react';

const PlainTextExample = () => {
  const editor = useEditor({
    extensions: [history()],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
  });

  return (
    <Plite editor={editor}>
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
    </Plite>
  );
};

export default PlainTextExample;

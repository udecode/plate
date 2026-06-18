import {
  Editable,
  type RenderPlaceholderProps,
  Slate,
  useSlateEditor,
} from '@platejs/slate-react';

const PlainTextExample = () => {
  const editor = useSlateEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
  });

  return (
    <Slate editor={editor}>
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
    </Slate>
  );
};

export default PlainTextExample;

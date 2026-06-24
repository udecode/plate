import {
  Editable,
  type RenderPlaceholderProps,
  Plite,
  usePliteEditor,
} from '@platejs/plite-react';

const PlainTextExample = () => {
  const editor = usePliteEditor({
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

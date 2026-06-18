import { Editable, Slate, useSlateEditor } from '@platejs/slate-react';

const StylingExample = () => {
  const editor1 = useSlateEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'This editor is styled using the style prop.' }],
      },
    ],
  });
  const editor2 = useSlateEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'This editor is styled using the className prop.' }],
      },
    ],
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <Slate editor={editor1}>
        <Editable
          style={{
            backgroundColor: 'rgb(255, 230, 156)',
            minHeight: '200px',
            outline: 'rgb(0, 128, 0) solid 2px',
          }}
        />
      </Slate>

      <Slate editor={editor2}>
        <Editable className="fancy" disableDefaultStyles />
      </Slate>
    </div>
  );
};

export default StylingExample;

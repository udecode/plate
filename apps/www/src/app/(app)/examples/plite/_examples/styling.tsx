import { Editable, Plite, usePliteEditor } from '@platejs/plite-react';

const StylingExample = () => {
  const editor1 = usePliteEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'This editor is styled using the style prop.' }],
      },
    ],
  });
  const editor2 = usePliteEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'This editor is styled using the className prop.' }],
      },
    ],
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <Plite editor={editor1}>
        <Editable
          style={{
            backgroundColor: 'rgb(255, 230, 156)',
            minHeight: '200px',
            outline: 'rgb(0, 128, 0) solid 2px',
          }}
        />
      </Plite>

      <Plite editor={editor2}>
        <Editable className="fancy" disableDefaultStyles />
      </Plite>
    </div>
  );
};

export default StylingExample;

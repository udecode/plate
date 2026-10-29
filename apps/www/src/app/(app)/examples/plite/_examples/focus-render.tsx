import { history } from 'plitejs/history';
import {
  Editable,
  EditorRoot,
  useEditor,
  useEditorFocused,
} from 'plitejs/react';

const FocusRingEditor = ({
  label,
  readOnly,
}: {
  label: string;
  readOnly?: boolean;
}) => {
  const editor = useEditor({
    plugins: [history()],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'A click places the caret.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Shift+Left then selects from it.' }],
      },
    ],
  });

  return (
    <EditorRoot editor={editor}>
      <FocusRingEditable label={label} readOnly={readOnly} />
    </EditorRoot>
  );
};

const FocusRingEditable = ({
  label,
  readOnly,
}: {
  label: string;
  readOnly?: boolean;
}) => {
  const focused = useEditorFocused();

  return (
    <Editable
      aria-label={label}
      readOnly={readOnly}
      style={{
        outline: focused ? '2px solid currentColor' : 'none',
        padding: 8,
      }}
    />
  );
};

const FocusRenderExample = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <FocusRingEditor label="Read-only editor" readOnly />
    <FocusRingEditor label="Editable editor" />
  </div>
);

export default FocusRenderExample;

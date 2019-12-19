import { Editor, Range } from 'slate';

export const onChangeMention = ({
  editor,
  setTarget,
  setSearch,
  setIndex,
  beforeRegex = /^@(\w+)$/,
}: {
  editor: Editor;
  setTarget: any;
  setSearch: any;
  setIndex: any;
  beforeRegex?: RegExp;
}) => {
  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection);
    const wordBefore = Editor.before(editor, start, { unit: 'word' });
    const before = wordBefore && Editor.before(editor, wordBefore);
    const beforeRange = before && Editor.range(editor, before, start);
    const beforeText = beforeRange && Editor.string(editor, beforeRange);
    const beforeMatch = beforeText && beforeText.match(beforeRegex);
    const after = Editor.after(editor, start);
    const afterRange = Editor.range(editor, start, after);
    const afterText = Editor.string(editor, afterRange);
    const afterMatch = afterText.match(/^(\s|$)/);
    if (beforeMatch && afterMatch) {
      setTarget(beforeRange);
      setSearch(beforeMatch[1]);
      setIndex(0);
      return;
    }
  }

  setTarget(null);
};

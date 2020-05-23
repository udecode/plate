import {
  BLOCKQUOTE,
  HeadingType,
  ListType,
  PARAGRAPH,
  toggleList,
} from 'elements';
import { Editor, Range, Transforms } from 'slate';

export const withElementAutoformat = ({
  typeUl = ListType.UL,
  typeOl = ListType.OL,
  typeLi = ListType.LI,
  typeH1 = HeadingType.H1,
  typeH2 = HeadingType.H2,
  typeH3 = HeadingType.H3,
  typeH4 = HeadingType.H4,
  typeH5 = HeadingType.H5,
  typeH6 = HeadingType.H6,
  typeBlockquote = BLOCKQUOTE,
  typeP = PARAGRAPH,
} = {}) => <T extends Editor>(editor: T) => {
  const options = {
    typeUl,
    typeOl,
    typeLi,
    typeBlockquote,
    typeH1,
    typeH2,
    typeH3,
    typeH4,
    typeH5,
    typeH6,
    typeP,
  };

  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);

      const SHORTCUTS: { [key: string]: string } = {
        '*': typeLi,
        '-': typeLi,
        '+': typeLi,
        '1.': typeLi,
        '>': typeBlockquote,
        '#': typeH1,
        '##': typeH2,
        '###': typeH3,
        '####': typeH4,
        '#####': typeH5,
        '######': typeH6,
      };

      const type = SHORTCUTS[beforeText];
      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        if (type !== typeLi) {
          Transforms.setNodes(
            editor,
            { type },
            { match: (n) => Editor.isBlock(editor, n) }
          );
        } else {
          const typeList = beforeText === '1.' ? typeOl : typeUl;

          toggleList(editor, { ...options, typeList });
        }
        return;
      }
    }

    insertText(text);
  };

  return editor;
};

import { Editor, Range, Transforms } from 'slate';
import { getTextFromBlockStartToAnchor } from '../../common/queries';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { BLOCKQUOTE } from '../../elements/blockquote';
import { HeadingType } from '../../elements/heading';
import { ListType, toggleList } from '../../elements/list';
import { PARAGRAPH } from '../../elements/paragraph';

/**
 * Enables support for autoformatting actions.
 */
export const withAutoformat = ({
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

  // const options = {
  //   shortcuts: [{}],
  // };

  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    const SPACE = ' ';

    if (text === SPACE && isCollapsed(selection)) {
      const beforeTextEntry = getTextFromBlockStartToAnchor(editor);

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

      const type = SHORTCUTS[beforeTextEntry.text];
      if (type) {
        Transforms.select(editor, beforeTextEntry.range as Range);
        Transforms.delete(editor);

        if (type !== typeLi) {
          Transforms.setNodes(
            editor,
            { type },
            { match: (n) => Editor.isBlock(editor, n) }
          );
        } else {
          const typeList = beforeTextEntry.text === '1.' ? typeOl : typeUl;

          toggleList(editor, { ...options, typeList });
        }
        return;
      }
    }

    insertText(text);
  };

  return editor;
};

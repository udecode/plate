import { castArray } from 'lodash';
import { Editor, Location, Range, Transforms } from 'slate';
import { getTextFromBlockStartToAnchor } from '../../common/queries';
import { getPointBefore } from '../../common/queries/getPointBefore';
import { getRangeBefore } from '../../common/queries/getRangeBefore';
import { getText } from '../../common/queries/getText';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { WithAutoformatOptions } from './types';

export const autoformat = (
  editor: Editor,
  type: string,
  at: Location,
  {
    preFormat,
    format,
  }: {
    preFormat?: (editor: Editor) => void;
    format?: (editor: Editor) => void;
  }
) => {
  Transforms.delete(editor, { at });

  preFormat?.(editor);

  if (!format) {
    Transforms.setNodes(
      editor,
      { type },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  } else {
    format(editor);
  }
};

/**
 * Enables support for autoformatting actions.
 */
export const withAutoformat = ({ rules }: WithAutoformatOptions) => <
  T extends Editor
>(
  editor: T
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (!isCollapsed(editor.selection)) return insertText(text);

    const selection = editor.selection as Range;

    let found = false;
    rules.some(({ trigger = ' ', markupRules, preFormat }) => {
      const triggers: string[] = castArray(trigger);

      // Check trigger
      if (!triggers.includes(text)) return false;

      const beforeTextEntry = getTextFromBlockStartToAnchor(editor);

      found = markupRules.some(({ type, markup, format, insert, inline }) => {
        const markups: string[] = castArray(markup);

        if (beforeTextEntry.range && markups.includes(beforeTextEntry.text)) {
          // Start of the block
          autoformat(editor, type, beforeTextEntry.range, {
            preFormat,
            format,
          });
          return true;
        }

        if (insert) {
          // Middle of the block
          const markupRange = getRangeBefore(editor, selection, {
            matchString: markup,
            unit: 'word',
          });

          if (markupRange) {
            autoformat(editor, type, markupRange, {
              preFormat: () => {
                preFormat?.(editor);
                editor.insertBreak();
              },
              format,
            });

            return true;
          }
        }

        if (inline) {
          const markupPoint = getPointBefore(editor, selection, {
            matchString: markup,
            skipInvalid: true,
          });

          const textRange = getRangeBefore(editor, selection, {
            matchString: markup,
            skipInvalid: true,
            afterMatch: true,
          });

          const markupText = getText(editor, textRange);

          if (!markupPoint || !textRange || !markupText) return false;

          Transforms.select(editor, textRange);

          editor.addMark(type, true);
          Transforms.collapse(editor, { edge: 'end' });
          editor.removeMark(type);
          // Editor.next(editor, { at})
          Transforms.delete(editor, {
            at: {
              anchor: markupPoint,
              focus: textRange.anchor,
            },
          });

          return true;
        }

        return false;
      });

      return true;
    });

    if (found) return;

    insertText(text);
  };

  return editor;
};

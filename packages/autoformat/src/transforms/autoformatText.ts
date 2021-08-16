import { getPointBefore } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Range, Transforms } from 'slate';
import { AutoformatTextRule } from '../types';

export interface AutoformatTextOptions extends AutoformatTextRule {
  text: string;
}

export const autoformatText = (
  editor: TEditor,
  { text, markup, trigger }: AutoformatTextOptions
) => {
  const selection = editor.selection as Range;

  // dup
  const startMarkup = Array.isArray(markup) ? markup[0] : (markup as string);
  const endMarkup = Array.isArray(markup)
    ? markup[1]
    : startMarkup.split('').reverse().join('');

  const triggers: string[] = trigger
    ? castArray(trigger)
    : [endMarkup.slice(-1)];

  if (!triggers.includes(text)) return false;

  const endMarkupWithoutTrigger = trigger ? endMarkup : endMarkup.slice(0, -1);

  let endMarkupPointBefore = selection.anchor;
  if (endMarkupWithoutTrigger) {
    endMarkupPointBefore = getPointBefore(editor, selection, {
      matchString: endMarkupWithoutTrigger,
    });

    if (!endMarkupPointBefore) return false;

    Transforms.delete(editor, {
      at: {
        anchor: endMarkupPointBefore,
        focus: selection.anchor,
      },
    });
  }
  //

  console.log(endMarkupPointBefore);

  // Transforms.delete(editor, { at: markupRange });

  // editor.insertText(text);

  return true;
};

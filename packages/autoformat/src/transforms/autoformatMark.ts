import {
  getPointBefore,
  getRangeBefore,
  getText,
  removeMark,
} from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Range, Transforms } from 'slate';
import { AutoformatMarkRule } from '../types';

export interface AutoformatMarkOptions extends AutoformatMarkRule {
  text: string;
}

export const autoformatMark = (
  editor: TEditor,
  { type, text, trigger, markup, ignoreTrim }: AutoformatMarkOptions
) => {
  if (!type) return false;

  const startMarkup = Array.isArray(markup) ? markup[0] : (markup as string);
  const endMarkup = Array.isArray(markup)
    ? markup[1]
    : startMarkup.split('').reverse().join('');

  const triggers: string[] = trigger
    ? castArray(trigger)
    : [endMarkup.slice(-1)];

  if (!triggers.includes(text)) return false;

  const selection = editor.selection as Range;

  const endMarkupWithoutTrigger = trigger ? endMarkup : endMarkup.slice(0, -1);

  let endMarkupPointBefore = selection.anchor;
  if (endMarkupWithoutTrigger) {
    endMarkupPointBefore = getPointBefore(editor, selection, {
      matchString: endMarkupWithoutTrigger,
    });

    if (!endMarkupPointBefore) return false;
  }

  const startMarkupPointAfter = getPointBefore(editor, endMarkupPointBefore, {
    matchString: startMarkup,
    skipInvalid: true,
    afterMatch: true,
  });

  if (!startMarkupPointAfter) return false;

  const startMarkupPointBefore = getPointBefore(editor, endMarkupPointBefore, {
    matchString: startMarkup,
    skipInvalid: true,
  });

  // Continue if there is no character before start markup
  const rangeBeforeStartMarkup = getRangeBefore(editor, startMarkupPointBefore);
  if (rangeBeforeStartMarkup) {
    const textBeforeStartMarkup = getText(editor, rangeBeforeStartMarkup);
    if (textBeforeStartMarkup) {
      const noWhiteSpaceRegex = new RegExp(`\\S+`);
      if (textBeforeStartMarkup.match(noWhiteSpaceRegex)) {
        return false;
      }
    }
  }

  // found

  const markupRange: Range = {
    anchor: startMarkupPointAfter,
    focus: endMarkupPointBefore,
  };

  if (!ignoreTrim) {
    const markupText = getText(editor, markupRange);
    if (markupText.trim() !== markupText) return false;
  }

  // delete end markup
  if (endMarkupWithoutTrigger) {
    Transforms.delete(editor, {
      at: {
        anchor: endMarkupPointBefore,
        focus: selection.anchor,
      },
    });
  }

  const marks = castArray(type);

  // add mark to the text between the markups
  Transforms.select(editor, markupRange);
  marks.forEach((mark) => {
    editor.addMark(mark, true);
  });
  Transforms.collapse(editor, { edge: 'end' });
  marks.forEach((mark) => {
    removeMark(editor, { key: mark, shouldChange: false });
  });

  Transforms.delete(editor, {
    at: {
      anchor: startMarkupPointBefore,
      focus: startMarkupPointAfter,
    },
  });

  return true;
};

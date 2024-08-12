import type { KeyboardHandler } from '@udecode/plate-common';

import {
  deleteBackward,
  getEditorString,
  getPointBefore,
  insertText,
  isHotkey,
} from '@udecode/plate-common';
import { Range } from 'slate';

import type {
  AutoformatPluginOptions,
  AutoformatRule,
  AutoformatTextRule,
} from './types';

export const onKeyDownAutoformat: KeyboardHandler<AutoformatPluginOptions> = ({
  editor,
  event,
  plugin: {
    options: { enableUndoOnDelete, rules },
  },
}) => {
  if (event.defaultPrevented) return false;
  // Abort quicky if hotKey was not pressed.
  if (!isHotkey('backspace', { byKey: true }, event)) return false;
  if (!rules) return false;
  if (!enableUndoOnDelete) return false;

  // Abort if selection is not collapsed i.e. we're not deleting single character.
  const { selection } = editor;

  if (!selection || !Range.isCollapsed(selection)) return;

  // Get start and end point of selection.
  // For example: Text|
  //                  ^ cursor at the moment of pressing the hotkey
  // start, end will be equal to the location of the |
  const [start, end] = Range.edges(selection);

  // Get location before the cursor.
  // before will be a point one character before | so:
  // Text|
  //    ^
  const before = getPointBefore(editor, end, {
    distance: 1,
    unit: 'character',
  });

  if (!start) return false;
  if (!before) return false;

  // Abort if there doesn't exist a valid character to replace.
  const charRange = { anchor: before, focus: start };

  if (!charRange) return false;

  // Text|
  //    ^
  // Between ^ and | is t
  const char = getEditorString(editor, charRange);

  if (!char) return false;

  const matchers: AutoformatRule[] = [...rules].filter((rule) => {
    const textRule = rule as AutoformatTextRule;

    if (textRule) {
      return textRule.mode === 'text' && textRule.format === char;
    }

    return false;
  });

  // abort if no matching substitution is found.
  if (!matchers || matchers.length === 0) return false;

  event.preventDefault();

  // remove the shorthand character.
  deleteBackward(editor, { unit: 'character' });

  // put back the orignal characters. This could match to a single string or an array.
  const rule = matchers[0] as AutoformatTextRule;

  if (rule && typeof rule.match === 'string') {
    insertText(editor, rule.match);
  } else {
    const matchArray = rule.match as string[];

    if (matchArray && matchArray.length > 0) {
      insertText(editor, matchArray[0]);
    }
  }

  return true;
};

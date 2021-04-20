import React, { useMemo } from 'react';
import {
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsOptions,
  getPointBefore,
  getText,
  isCollapsed,
  SlatePlugin,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { Range, Transforms } from 'slate';
import { initialValueCombobox } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import emojiJson from './emoji/emojis.json';

const id = 'Examples/Emoji';

export default {
  title: id,
};

/**
 * reduce the emoji json to a dict of emoji name => char
 */
const emojiDict = emojiJson.reduce((prev, curr) => {
  prev[curr.name] = curr.char;
  return prev;
}, {});

const useEmojiPlugin = (): SlatePlugin => {
  return {
    withOverrides: (editor) => {
      const { insertText } = editor;
      editor.insertText = (text) => {
        if (!isCollapsed(editor.selection)) {
          return insertText(text);
        }

        const selection = editor.selection as Range;

        const startMarkup = ':';
        const endMarkup = ':';

        if (text !== endMarkup) {
          return insertText(text);
        }

        const endMarkupPointBefore = selection.anchor;

        const startMarkupPointBefore = getPointBefore(
          editor,
          selection.anchor,
          {
            matchString: startMarkup,
            skipInvalid: true,
          }
        );

        if (!startMarkupPointBefore) return insertText(text);

        const markupRange: Range = {
          anchor: startMarkupPointBefore,
          focus: endMarkupPointBefore,
        };

        const markupText = getText(editor, markupRange);

        const emojiName = markupText.slice(startMarkup.length);
        if (emojiName in emojiDict) {
          Transforms.select(editor, markupRange);
          Transforms.insertText(editor, emojiDict[emojiName]);
          Transforms.collapse(editor, { edge: 'end' });
          return false;
        }

        return insertText(text);
      };

      return editor;
    },
  };
};

const options = createSlatePluginsOptions();

export const Example = () => {
  const plugins: SlatePlugin[] = useMemo(
    () => [createReactPlugin(), createHistoryPlugin(), useEmojiPlugin()],
    []
  );

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueCombobox}
    />
  );
};

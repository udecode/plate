import React, { useCallback, useMemo } from 'react';
import {
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsOptions,
  getPointBefore,
  getText,
  isCollapsed,
  OnChange,
  SlatePlugin,
  SlatePlugins,
  useStoreEditor,
} from '@udecode/slate-plugins';
import { BaseEmoji, emojiIndex } from 'emoji-mart';
import { Range, Transforms } from 'slate';
import { initialValueCombobox } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';
import { useComboboxControls } from './combobox/hooks/useComboboxControls';
import { useComboboxOnKeyDown } from './combobox/hooks/useComboboxOnKeyDown';
import { useComboboxIsOpen } from './combobox/selectors/useComboboxIsOpen';
import { useComboboxStore } from './combobox/useComboboxStore';
import { EmojiCombobox } from './emoji/components/EmojiCombobox';
import { useEmojiOnChange } from './emoji/hooks/useEmojiOnChange';
import { useEmojiOnSelectItem } from './emoji/hooks/useEmojiOnSelectItem';

const id = 'Examples/Emoji';

export default {
  title: id,
};

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

        if (!text.endsWith(endMarkup)) {
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
        // remove start markup from the txt
        // i.e. :safety_pin => safety_pin
        const emojiName = markupText.slice(startMarkup.length);

        if (emojiName in emojiIndex.emojis) {
          Transforms.select(editor, markupRange);

          let emoji = emojiIndex.emojis[emojiName];
          // if the emoji has skin variants the index returns an object indexed
          // by the numbers 1-6. for now opt for 1 (generic)
          if (!('id' in emoji)) {
            emoji = emoji['1'];
          }
          Transforms.insertText(editor, (emoji as BaseEmoji).native);
          Transforms.collapse(editor, { edge: 'end' });
          return false;
        }

        return insertText(text);
      };

      return editor;
    },
  };
};

// Handle multiple combobox
const useComboboxOnChange = (): OnChange => {
  const editor = useStoreEditor(id)!;

  const emojiOnChange = useEmojiOnChange(editor);
  const isOpen = useComboboxIsOpen();
  const closeMenu = useComboboxStore((state) => state.closeMenu);

  return useCallback(
    () => () => {
      let changed: boolean | undefined = false;
      changed = emojiOnChange();

      if (changed) return;

      if (!changed && isOpen) {
        closeMenu();
      }
    },
    [closeMenu, isOpen, emojiOnChange]
  );
};

// Handle multiple combobox
const ComboboxContainer = () => {
  useComboboxControls();

  return <EmojiCombobox />;
};

const options = createSlatePluginsOptions();

export const Example = () => {
  const comboboxOnChange = useComboboxOnChange();

  const emojiOnSelect = useEmojiOnSelectItem();

  // Handle multiple combobox
  const comboboxOnKeyDown = useComboboxOnKeyDown({
    onSelectItem: emojiOnSelect,
  });

  const plugins: SlatePlugin[] = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      useEmojiPlugin(),
      {
        onChange: comboboxOnChange,
        onKeyDown: comboboxOnKeyDown,
      },
    ],
    [comboboxOnChange, comboboxOnKeyDown]
  );

  return (
    <SlatePlugins
      id={id}
      plugins={plugins}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueCombobox}
    >
      <ComboboxContainer />
    </SlatePlugins>
  );
};

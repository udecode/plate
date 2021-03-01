import React, { useCallback, useMemo, useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  pipe,
  SlateDocument,
  withInlineVoid,
} from '@udecode/slate-plugins';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueCombobox, options } from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';
import { useComboboxControls } from './combobox/hooks/useComboboxControls';
import { useComboboxOnKeyDown } from './combobox/hooks/useComboboxOnKeyDown';
import { useComboboxIsOpen } from './combobox/selectors/useComboboxIsOpen';
import { useComboboxStore } from './combobox/useComboboxStore';
import { TagCombobox } from './tag/components/TagCombobox';
import { useTagOnChange } from './tag/hooks/useTagOnChange';
import { useTagOnSelectItem } from './tag/hooks/useTagOnSelectItem';
import { TagPlugin } from './tag/TagPlugin';

export default {
  title: 'Examples/Combobox',
};

const useComboboxOnChange = (editor: Editor) => {
  const tagOnChange = useTagOnChange(editor, MENTIONABLES);
  const isOpen = useComboboxIsOpen();
  const closeMenu = useComboboxStore((state) => state.closeMenu);

  return useCallback(() => {
    let changed: boolean | undefined = false;
    changed = tagOnChange();

    if (changed) return;

    if (!changed && isOpen) {
      closeMenu();
    }
  }, [closeMenu, isOpen, tagOnChange]);
};

const plugins = [TagPlugin(options)];

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({ plugins }),
] as const;

const ComboboxContainer = () => {
  useComboboxControls();

  return <TagCombobox />;
};

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueCombobox);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    const comboboxOnChange = useComboboxOnChange(editor);

    const itemIndex = useComboboxStore((state) => state.itemIndex);
    const comboboxSearch = useComboboxStore((state) => state.search);
    const tagTargetRange = useComboboxStore((state) => state.targetRange);

    const tagOnSelect = useTagOnSelectItem();

    const comboboxOnKeyDown = useComboboxOnKeyDown({
      onSelectItem: tagOnSelect,
    });

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue as SlateDocument);
          comboboxOnChange();
        }}
      >
        <ComboboxContainer />
        <EditablePlugins
          plugins={plugins}
          onKeyDown={[comboboxOnKeyDown]}
          onKeyDownDeps={[
            editor,
            itemIndex,
            comboboxSearch,
            tagTargetRange,
            comboboxOnKeyDown,
          ]}
          readOnly={boolean('readOnly', false)}
          placeholder={text('placeholder', 'Enter some plain text...')}
          spellCheck={boolean('spellCheck', true)}
          autoFocus
        />
      </Slate>
    );
  };

  const EditorContainer = createReactEditor();

  return <EditorContainer />;
};

import React, { useCallback } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  getSlatePluginsOptions,
  SlateDocument,
  SlatePlugins,
  useHistoryPlugin,
  useReactPlugin,
  useSlatePluginsActions,
  useSlatePluginsEditor,
} from '@udecode/slate-plugins';
import { getSlatePluginsComponents } from '@udecode/slate-plugins-components';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { editableProps } from '../../stories/config/initialValues';
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

const id = 'Examples/Combobox';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

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

const plugins = [useReactPlugin(), useHistoryPlugin(), TagPlugin(options)];

const ComboboxContainer = () => {
  useComboboxControls();

  return <TagCombobox />;
};

export const Example = () => {
  const createReactEditor = () => () => {
    const editor = useSlatePluginsEditor(id);
    const { setValue } = useSlatePluginsActions(id);

    const comboboxOnChange = useComboboxOnChange(editor);

    const itemIndex = useComboboxStore((state) => state.itemIndex);
    const comboboxSearch = useComboboxStore((state) => state.search);
    const tagTargetRange = useComboboxStore((state) => state.targetRange);

    const tagOnSelect = useTagOnSelectItem();

    const comboboxOnKeyDown = useComboboxOnKeyDown({
      onSelectItem: tagOnSelect,
    });

    return (
      <SlatePlugins
        id={id}
        plugins={plugins}
        components={components}
        options={options}
        editableProps={editableProps}
        initialValue={initialValueCombobox}
        // onKeyDown={[comboboxOnKeyDown]}
        //           onKeyDownDeps={[
        //             editor,
        //             itemIndex,
        //             comboboxSearch,
        //             tagTargetRange,
        //             comboboxOnKeyDown,
        //           ]}
        onChange={(newValue) => {
          setValue(newValue as SlateDocument);
          comboboxOnChange();
        }}
      >
        <ComboboxContainer />
      </SlatePlugins>
    );
  };

  const EditorContainer = createReactEditor();

  return <EditorContainer />;
};

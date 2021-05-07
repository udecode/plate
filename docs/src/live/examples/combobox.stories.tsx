import React, { useCallback, useMemo } from 'react';
import {
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  OnChange,
  SlatePlugin,
  SlatePlugins,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import { initialValueCombobox } from '../config/initialValues';
import { MENTIONABLES } from '../config/mentionables';
import { editableProps } from '../config/pluginOptions';
import { useComboboxControls } from './combobox/hooks/useComboboxControls';
import { useComboboxOnKeyDown } from './combobox/hooks/useComboboxOnKeyDown';
import { useComboboxIsOpen } from './combobox/selectors/useComboboxIsOpen';
import { useComboboxStore } from './combobox/useComboboxStore';
import { TagCombobox } from './tag/components/TagCombobox';
import { TagElement } from './tag/components/TagElement';
import { createTagPlugin } from './tag/createTagPlugin';
import { ELEMENT_TAG } from './tag/defaults';
import { useTagOnChange } from './tag/hooks/useTagOnChange';
import { useTagOnSelectItem } from './tag/hooks/useTagOnSelectItem';

const id = 'Examples/Combobox';

export default {
  title: id,
};

const components = createSlatePluginsComponents({
  [ELEMENT_TAG]: TagElement,
});
const options = createSlatePluginsOptions();

// Handle multiple combobox
const useComboboxOnChange = (): OnChange => {
  const editor = useStoreEditorRef(id)!;

  const tagOnChange = useTagOnChange(editor, MENTIONABLES);
  const isOpen = useComboboxIsOpen();
  const closeMenu = useComboboxStore((state) => state.closeMenu);

  return useCallback(
    () => () => {
      let changed: boolean | undefined = false;
      changed = tagOnChange();

      if (changed) return;

      if (!changed && isOpen) {
        closeMenu();
      }
    },
    [closeMenu, isOpen, tagOnChange]
  );
};

// Handle multiple combobox
const ComboboxContainer = () => {
  useComboboxControls();

  return <TagCombobox />;
};

export const Example = () => {
  const comboboxOnChange = useComboboxOnChange();

  const tagOnSelect = useTagOnSelectItem();

  // Handle multiple combobox
  const comboboxOnKeyDown = useComboboxOnKeyDown({
    onSelectItem: tagOnSelect,
  });

  const plugins: SlatePlugin[] = useMemo(
    () => [
      createReactPlugin(),
      createHistoryPlugin(),
      createTagPlugin(),
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
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValueCombobox}
    >
      <ComboboxContainer />
    </SlatePlugins>
  );
};

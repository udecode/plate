import React, { useEffect } from 'react';
import {
  comboboxActions,
  ComboboxContent,
  ComboboxContentProps,
  Data,
  NoData,
  useActiveComboboxStore,
  useComboboxControls,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  useEventEditorSelectors,
  usePlateEditorState,
} from '@udecode/plate-core';
import { PortalBody } from '@udecode/plate-styled-components';
import { getComboboxStyles } from './Combobox.styles';
import { PlateComboboxProps } from './Combobox.types';
import { PlateComboboxContentItem } from './PlateComboboxContentItem';

const PlateComboboxContent = <TData extends Data = NoData>(
  props: ComboboxContentProps<TData>
) => {
  const { portalElement, component: Component } = props;
  const { root, item: styleItem, highlightedItem } = getComboboxStyles(
    props as any
  );

  const activeComboboxStore = useActiveComboboxStore()!;
  const combobox = useComboboxControls();

  const filteredItems = useComboboxSelectors.filteredItems();

  return (
    <PortalBody element={portalElement}>
      <ComboboxContent.Root
        css={root.css}
        className={root.className}
        combobox={combobox}
      >
        {Component ? Component({ store: activeComboboxStore }) : null}

        {filteredItems.map((item, index) => (
          <PlateComboboxContentItem
            item={item}
            highlightedItem={highlightedItem}
            index={index}
            styleItem={styleItem}
            combobox={combobox}
          />
        ))}
      </ComboboxContent.Root>
    </PortalBody>
  );
};

/**
 * Register the combobox id, trigger, onSelectItem
 * Renders the combobox if active.
 */
export const PlateCombobox = <TData extends Data = NoData>({
  id,
  trigger,
  searchPattern,
  onSelectItem,
  controlled,
  maxSuggestions,
  filter,
  sort,
  floatingOptions,
  disabled: _disabled,
  ...props
}: PlateComboboxProps<TData>) => {
  const storeItems = useComboboxSelectors.items();
  const disabled = _disabled ?? (!storeItems.length && !props.items?.length);

  const editor = usePlateEditorState();
  const focusedEditorId = useEventEditorSelectors.focus?.();
  const combobox = useComboboxControls();
  const activeId = useComboboxSelectors.activeId();

  useEffect(() => {
    if (floatingOptions) {
      comboboxActions.floatingOptions(floatingOptions);
    }
  }, [floatingOptions]);

  useEffect(() => {
    comboboxActions.setComboboxById({
      id,
      trigger,
      searchPattern,
      controlled,
      onSelectItem,
      maxSuggestions,
      filter,
      sort,
    });
  }, [
    id,
    trigger,
    searchPattern,
    controlled,
    onSelectItem,
    maxSuggestions,
    filter,
    sort,
  ]);

  if (
    !combobox ||
    !editor.selection ||
    focusedEditorId !== editor.id ||
    activeId !== id ||
    disabled
  ) {
    return null;
  }

  return <PlateComboboxContent {...props} />;
};

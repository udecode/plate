'use client';

import React, { useEffect } from 'react';

import * as Popover from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import {
  type ComboboxContentItemProps,
  type ComboboxContentProps,
  type ComboboxProps,
  comboboxActions,
  useActiveComboboxStore,
  useComboboxContent,
  useComboboxContentState,
  useComboboxControls,
  useComboboxItem,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  useEditorRef,
  useEditorSelector,
  useEventEditorSelectors,
  usePlateSelectors,
} from '@udecode/plate-common';
import {
  createVirtualRef,
  getBoundingClientRect,
} from '@udecode/plate-floating';

export const ComboboxItem = withRef<'div', ComboboxContentItemProps>(
  ({ className, combobox, index, item, onRenderItem, ...rest }, ref) => {
    const { props } = useComboboxItem({ combobox, index, item, onRenderItem });

    return (
      <div
        className={cn(
          'relative flex h-9 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          'hover:bg-accent hover:text-accent-foreground data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground',
          className
        )}
        ref={ref}
        {...props}
        {...rest}
      />
    );
  }
);

export function ComboboxContent(props: ComboboxContentProps) {
  const {
    combobox,
    component: Component,
    items,
    onRenderItem,
    portalElement,
  } = props;

  const editor = useEditorRef();

  const filteredItems = useComboboxSelectors.filteredItems();
  const activeComboboxStore = useActiveComboboxStore()!;

  const state = useComboboxContentState({ combobox, items });
  const { menuProps, targetRange } = useComboboxContent(state);

  const virtualRef = createVirtualRef(editor, targetRange ?? undefined, {
    fallbackRect: getBoundingClientRect(editor, editor.selection!),
  });

  return (
    <Popover.Root open>
      <Popover.PopoverAnchor virtualRef={virtualRef} />

      <Popover.Portal container={portalElement}>
        <Popover.Content
          {...menuProps}
          align="start"
          className={cn(
            'z-[500] m-0 max-h-[288px] w-[300px] overflow-scroll rounded-md bg-popover p-0 shadow-md'
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
          side="bottom"
          sideOffset={5}
        >
          {Component ? Component({ store: activeComboboxStore }) : null}

          {filteredItems.map((item, index) => (
            <ComboboxItem
              combobox={combobox}
              index={index}
              item={item}
              key={item.key}
              onRenderItem={onRenderItem}
            />
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function Combobox({
  controlled,
  disabled: _disabled,
  filter,
  id,
  maxSuggestions,
  onSelectItem,
  searchPattern,
  sort,
  trigger,
  ...props
}: ComboboxProps) {
  const storeItems = useComboboxSelectors.items();
  const disabled =
    _disabled ?? (storeItems.length === 0 && !props.items?.length);

  const focusedEditorId = useEventEditorSelectors.focus?.();
  const combobox = useComboboxControls();
  const activeId = useComboboxSelectors.activeId();
  const selectionDefined = useEditorSelector(
    (editor) => !!editor.selection,
    []
  );
  const editorId = usePlateSelectors().id();

  useEffect(() => {
    comboboxActions.setComboboxById({
      controlled,
      filter,
      id,
      maxSuggestions,
      onSelectItem,
      searchPattern,
      sort,
      trigger,
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
    !selectionDefined ||
    focusedEditorId !== editorId ||
    activeId !== id ||
    disabled
  ) {
    return null;
  }

  return <ComboboxContent combobox={combobox} {...props} />;
}

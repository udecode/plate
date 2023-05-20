import React, { useCallback, useEffect } from 'react';
import {
  comboboxActions,
  comboboxSelectors,
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
  Data,
  getComboboxStoreById,
  NoData,
  TComboboxItem,
  useActiveComboboxStore,
  useComboboxControls,
  useComboboxSelectors,
} from '@udecode/plate-combobox';
import {
  RenderFunction,
  useEventEditorSelectors,
  usePlateEditorState,
} from '@udecode/plate-common';
import {
  flip,
  getRangeBoundingClientRect,
  offset,
  shift,
  useVirtualFloating,
} from '@udecode/plate-floating';
import { cn, cva, PortalBody } from '@udecode/plate-tailwind';

const comboboxItemVariants = cva(
  'flex min-h-[36px] cursor-pointer select-none items-center rounded-none px-2 text-[14px] text-[rgb(32,31,30)]'
);

export interface ComboboxItemProps<TData> {
  item: TComboboxItem<TData>;
  search: string;
}

export interface ComboboxProps<TData = NoData>
  extends Partial<Pick<ComboboxState<TData>, 'items' | 'floatingOptions'>>,
    ComboboxStateById<TData> {
  /**
   * Render this component when the combobox is open (useful to inject hooks).
   */
  component?: RenderFunction<{ store: ComboboxStoreById }>;

  /**
   * Whether to hide the combobox.
   * @default !items.length
   */
  disabled?: boolean;

  /**
   * Render combobox item.
   * @default text
   */
  onRenderItem?: RenderFunction<ComboboxItemProps<TData>>;

  portalElement?: Element;
}

function ComboboxContent<TData extends Data = NoData>(
  props: Omit<
    ComboboxProps<TData>,
    | 'id'
    | 'trigger'
    | 'searchPattern'
    | 'onSelectItem'
    | 'controlled'
    | 'maxSuggestions'
    | 'filter'
    | 'sort'
  >
) {
  const { component: Component, items, portalElement, onRenderItem } = props;

  const targetRange = useComboboxSelectors.targetRange();
  const filteredItems = useComboboxSelectors.filteredItems();
  const highlightedIndex = useComboboxSelectors.highlightedIndex();
  const floatingOptions = useComboboxSelectors.floatingOptions();
  const editor = usePlateEditorState();
  const combobox = useComboboxControls();
  const activeComboboxStore = useActiveComboboxStore()!;
  const text = useComboboxSelectors.text() ?? '';
  const storeItems = useComboboxSelectors.items();
  const filter = activeComboboxStore.use.filter?.();
  const sort = activeComboboxStore.use.sort?.();
  const maxSuggestions =
    activeComboboxStore.use.maxSuggestions?.() ?? storeItems.length;

  // Update items
  useEffect(() => {
    items && comboboxActions.items(items);
  }, [items]);

  // Filter items
  useEffect(() => {
    comboboxActions.filteredItems(
      storeItems
        .filter(
          filter
            ? filter(text)
            : (value) => value.text.toLowerCase().startsWith(text.toLowerCase())
        )
        .sort(sort?.(text))
        .slice(0, maxSuggestions)
    );
  }, [filter, sort, storeItems, maxSuggestions, text]);

  // Get target range rect
  const getBoundingClientRect = useCallback(
    () => getRangeBoundingClientRect(editor, targetRange),
    [editor, targetRange]
  );

  // Update popper position
  const { style, refs } = useVirtualFloating({
    placement: 'bottom-start',
    getBoundingClientRect,
    middleware: [offset(4), shift(), flip()],
    ...floatingOptions,
  });

  const menuProps = combobox
    ? combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  return (
    <PortalBody element={portalElement}>
      <ul
        {...menuProps}
        ref={refs.setFloating}
        style={style}
        className={cn(
          'z-[500] m-0 max-h-[288px] w-[300px] overflow-scroll rounded-b-[2px] bg-white p-0 shadow-[rgba(0,0,0,0.133)_0_3.2px_7.2px_0,rgba(0,0,0,0.11)_0_0.6px_1.8px_0]'
        )}
      >
        {Component ? Component({ store: activeComboboxStore }) : null}

        {filteredItems.map((item, index) => {
          const Item = onRenderItem
            ? onRenderItem({ search: text, item: item as TComboboxItem<TData> })
            : item.text;

          const highlighted = index === highlightedIndex;

          return (
            <div
              key={item.key}
              className={
                !highlighted
                  ? cn(
                      comboboxItemVariants(),
                      'bg-transparent hover:bg-[rgb(243,242,241)]'
                    )
                  : cn(
                      comboboxItemVariants,
                      'bg-[rgb(237,235,233)] hover:bg-[rgb(237,235,233)]'
                    )
              }
              {...combobox.getItemProps({
                item,
                index,
              })}
              onMouseDown={(e) => {
                e.preventDefault();

                const onSelectItem = getComboboxStoreById(
                  comboboxSelectors.activeId()
                )?.get.onSelectItem();
                onSelectItem?.(editor, item);
              }}
            >
              {Item}
            </div>
          );
        })}
      </ul>
    </PortalBody>
  );
}

/**
 * Register the combobox id, trigger, onSelectItem
 * Renders the combobox if active.
 */
export function Combobox<TData extends Data = NoData>({
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
}: ComboboxProps<TData>) {
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

  return <ComboboxContent {...props} />;
}

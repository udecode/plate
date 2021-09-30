import React, { useCallback, useEffect } from 'react';
import { useEditorState, useEventEditorId } from '@udecode/plate-core';
import { PortalBody } from '@udecode/plate-styled-components';
import { comboboxStore, getComboboxStoreById } from '../combobox.store';
import { useComboboxControls } from '../hooks/useComboboxControls';
import { getRangeBoundingClientRect } from '../popper/getRangeBoundingClientRect';
import { usePopperPosition } from '../popper/usePopperPosition';
import { ComboboxItem, ComboboxRoot } from './Combobox.styles';
import { ComboboxProps } from './Combobox.types';

const ComboboxContent = ({
  id,
  component: Component,
  onRenderItem,
}: Pick<ComboboxProps, 'id' | 'component' | 'onRenderItem'>) => {
  const targetRange = comboboxStore.use.targetRange();
  const items = comboboxStore.use.items();
  const itemIndex = comboboxStore.use.itemIndex();
  const popperContainer = comboboxStore.use.popperContainer();
  const popperOptions = comboboxStore.use.popperOptions();
  const editor = useEditorState();
  const combobox = useComboboxControls();

  const popperRef = React.useRef<any>(null);

  const getBoundingClientRect = useCallback(
    () => getRangeBoundingClientRect(editor, targetRange),
    [editor, targetRange]
  );

  const [popperStyles, attributes] = usePopperPosition({
    popperElement: popperRef.current,
    popperContainer,
    popperOptions,
    placement: 'bottom-start',
    getBoundingClientRect,
    offset: [0, 4],
  });

  const menuProps = combobox
    ? combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  return (
    <PortalBody>
      <ComboboxRoot
        {...menuProps}
        ref={popperRef}
        style={popperStyles.popper}
        {...attributes.popper}
      >
        <Component />

        {items.map((item, index) => {
          const Item = onRenderItem ? onRenderItem({ item }) : item.text;

          return (
            <ComboboxItem
              key={item.key}
              highlighted={index === itemIndex}
              {...combobox.getItemProps({
                item,
                index,
              })}
              onMouseDown={(e) => {
                e.preventDefault();

                const onSelectItem = getComboboxStoreById(
                  id
                )?.get.onSelectItem();
                onSelectItem?.(editor, item);
              }}
            >
              {Item}
            </ComboboxItem>
          );
        })}
      </ComboboxRoot>

      {/* <Tippy */}
      {/*  render={(attrs) => ( */}
      {/*    */}
      {/*  )} */}
      {/*  visible={isOpen} */}
      {/*  placement="bottom-start" */}
      {/*  interactive */}
      {/*  offset={[0, 0]} */}
      {/* > */}
      {/*  <div ref={popupRef} css={tw`absolute z-20 h-6`} /> */}
      {/* </Tippy> */}
    </PortalBody>
  );
};

/**
 * Register the combobox id, trigger, onSelectItem
 * Renders the combobox if active.
 */
export const Combobox = (props: ComboboxProps) => {
  const { id, trigger, onSelectItem, component, onRenderItem } = props;
  const activeId = comboboxStore.use.activeId();
  const editor = useEditorState();
  const focusedEditorId = useEventEditorId('focus');

  const combobox = useComboboxControls();

  useEffect(() => {
    comboboxStore.set.setComboboxById({ id, trigger, onSelectItem });
  }, [id, onSelectItem, trigger]);

  if (
    activeId !== id ||
    !combobox ||
    !editor.selection ||
    focusedEditorId !== editor.id
  )
    return null;

  return (
    <ComboboxContent
      id={id}
      component={component}
      onRenderItem={onRenderItem}
    />
  );
};

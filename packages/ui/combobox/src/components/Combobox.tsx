import React, { useEffect } from 'react';
import Tippy from '@tippyjs/react';
import { useEditorState, useEventEditorId } from '@udecode/plate-core';
import { PortalBody } from '@udecode/plate-styled-components';
import { comboboxStore, getComboboxStoreById } from '../combobox.store';
import { useComboboxControls } from '../hooks/useComboboxControls';
import { setElementPositionByRange } from '../utils/setElementPositionByRange';
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
  const isOpen = comboboxStore.use.isOpen();
  const combobox = useComboboxControls();

  console.log('halo');

  const editor = useEditorState();
  const focusedEditorId = useEventEditorId('focus');
  const ref = React.useRef<any>(null);

  useEffect(() => {
    if (focusedEditorId !== editor.id) return;

    setElementPositionByRange(editor, { ref, at: targetRange });
  }, [targetRange, editor, focusedEditorId]);

  const menuProps = combobox
    ? combobox.getMenuProps({}, { suppressRefError: true })
    : { ref: null };

  if (focusedEditorId !== editor.id || !editor.selection || !combobox)
    return null;

  return (
    <PortalBody>
      <Tippy
        render={(attrs) => (
          <ComboboxRoot {...menuProps} {...attrs}>
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
        )}
        visible={isOpen}
        placement="bottom-start"
        interactive
        offset={[0, 0]}
      >
        <div ref={ref} className="absolute z-20 h-6" />
      </Tippy>
    </PortalBody>
  );
};

export const Combobox = (props: ComboboxProps) => {
  const { id, trigger, onSelectItem, component, onRenderItem } = props;
  const activeId = comboboxStore.use.activeId();

  useComboboxControls();

  useEffect(() => {
    comboboxStore.set.setComboboxById({ id, trigger, onSelectItem });
  }, [id, onSelectItem, trigger]);

  console.log(activeId, id);

  if (activeId !== id) return null;

  return (
    <ComboboxContent
      id={id}
      component={component}
      onRenderItem={onRenderItem}
    />
  );
};

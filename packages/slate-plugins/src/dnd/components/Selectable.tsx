import React, { useRef } from 'react';
import useMergedRef from '@react-hook/merged-ref';
import Tippy from '@tippyjs/react';
import { mergeStyles } from '@uifabric/styling';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { useDndBlock } from '../hooks/useDndBlock';
import { grabberTooltipProps } from './grabberTooltipProps';
import { getSelectableStyles } from './Selectable.styles';
import {
  SelectableProps,
  SelectableStyleProps,
  SelectableStyles,
} from './Selectable.types';

const getClassNames = classNamesFunction<
  SelectableStyleProps,
  SelectableStyles
>();

const SelectableBase = ({
  children,
  element,
  className,
  styles,
  componentRef,
  dragIcon,
}: SelectableProps) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const multiRootRef = useMergedRef(componentRef, rootRef);

  const { dropLine, dragRef, isDragging } = useDndBlock({
    id: element.id,
    blockRef: rootRef,
  });

  const dragWrapperRef = useRef(null);
  const multiDragRef = useMergedRef(dragRef, dragWrapperRef);

  const classNames = getClassNames(styles, {
    className,
    direction: dropLine,
    isDragging,
  });

  return (
    <div className={classNames.root} ref={multiRootRef}>
      <div
        ref={blockRef}
        className={mergeStyles(classNames.blockAndGutter, classNames.block)}
      >
        {children}

        {!!dropLine && (
          <div className={classNames.dropLine} contentEditable={false} />
        )}
      </div>

      <div
        className={mergeStyles(
          classNames.blockAndGutter,
          classNames.gutterLeft
        )}
        contentEditable={false}
      >
        <div className={classNames.blockToolbarWrapper}>
          <div className={classNames.blockToolbar}>
            <Tippy {...grabberTooltipProps}>
              <div ref={multiDragRef}>
                <button
                  type="button"
                  className={classNames.dragButton}
                  onMouseDown={(e: any) => e.stopPropagation()}
                >
                  {dragIcon}
                </button>
              </div>
            </Tippy>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Selectable = styled<
  SelectableProps,
  SelectableStyleProps,
  SelectableStyles
>(SelectableBase, getSelectableStyles, undefined, {
  scope: 'Selectable',
});

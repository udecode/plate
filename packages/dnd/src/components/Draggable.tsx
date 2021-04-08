import React, { useRef } from 'react';
import useMergedRef from '@react-hook/merged-ref';
import Tippy from '@tippyjs/react';
import { mergeStyles } from '@uifabric/styling';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { useDndBlock } from '../hooks/useDndBlock';
import { getDraggableStyles } from './Draggable.styles';
import {
  DraggableProps,
  DraggableStyleProps,
  DraggableStyleSet,
} from './Draggable.types';
import { grabberTooltipProps } from './grabberTooltipProps';

const getClassNames = classNamesFunction<
  DraggableStyleProps,
  DraggableStyleSet
>();

export const DraggableBase = ({
  children,
  element,
  className,
  styles,
  componentRef,
  dragIcon,
}: DraggableProps) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragWrapperRef = useRef(null);
  const multiRootRef = useMergedRef(componentRef, rootRef);

  const { dropLine, dragRef, isDragging } = useDndBlock({
    id: element.id,
    blockRef: rootRef,
  });

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
          <div className={classNames.blockToolbar} ref={multiDragRef}>
            <Tippy {...grabberTooltipProps}>
              <button
                type="button"
                className={classNames.dragButton}
                onMouseDown={(e: any) => e.stopPropagation()}
              >
                {dragIcon}
              </button>
            </Tippy>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Draggable = styled<
  DraggableProps,
  DraggableStyleProps,
  DraggableStyleSet
>(DraggableBase, getDraggableStyles, undefined, {
  scope: 'Draggable',
});

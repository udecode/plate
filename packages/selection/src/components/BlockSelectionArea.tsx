import React from 'react';
import { deselectEditor, useEditorRef } from '@udecode/plate-common';
import { blockSelectionActions } from '../blockSelectionStore';
import {
  SelectionArea,
  SelectionAreaProps,
  SelectionEvent,
} from './SelectionArea';

export interface BlockSelectionAreaProps extends Partial<SelectionAreaProps> {}

export const useBlockSelectionArea = (
  props: BlockSelectionAreaProps
): SelectionAreaProps => {
  const editor = useEditorRef();

  const onStart = ({ event, selection }: SelectionEvent) => {
    deselectEditor(editor);

    if (!event?.shiftKey) {
      selection.clearSelection();
      blockSelectionActions.resetSelectedIds();
    }
  };

  const onMove = ({ store: { changed } }: SelectionEvent) => {
    if (!changed.added.length && !changed.removed.length) return;

    blockSelectionActions.setSelectedIds(changed);
  };

  return {
    className: 'slate-SelectionArea',
    style: {
      position: 'relative',
    },
    onStart,
    onMove,
    // Class for the selection-area itself (the element).
    selectionAreaClass: 'slate-selection-area',
    // Class for the selection-area container.
    // selectionContainerClass="selection-area-container"
    // Query selector or dom-node to set up container for the selection-area element.
    // container="body"
    // document object - if you want to use it within an embed document (or iframe).
    // document={window.document}
    // Query selectors for elements which can be selected.
    selectables: '.slate-selectable',
    // Query selectors for elements from where a selection can be started from.
    startAreas: '.slate-start-area',
    // Query selectors for elements which will be used as boundaries for the selection.
    // boundaries={['html']}
    // Behaviour related options.
    // behaviour={{
    //   // Specifies what should be done if already selected elements get selected again.
    //   //   invert: Invert selection for elements which were already selected
    //   //   keep: Keep selected elements (use clearSelection() to remove those)
    //   //   drop: Remove stored elements after they have been touched
    //   overlap: 'invert',
    //
    //   // On which point an element should be selected.
    //   // Available modes are cover (cover the entire element), center (touch the center) or
    //   // the default mode is touch (just touching it).
    //   intersect: 'touch',
    //
    //   // px, how many pixels the point should move before starting the selection (combined distance).
    //   // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
    //   startThreshold: 10,
    //
    //   // Scroll configuration.
    //   scrolling: {
    //     // On scrollable areas the number on px per frame is devided by this amount.
    //     // Default is 10 to provide a enjoyable scroll experience.
    //     speedDivider: 10,
    //
    //     // Browsers handle mouse-wheel events differently, this number will be used as
    //     // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider.
    //     manualSpeed: 750,
    //
    //     // This property defines the virtual inset margins from the borders of the container
    //     // component that, when crossed by the mouse/touch, trigger the scrolling. Useful for
    //     // fullscreen containers.
    //     startScrollMargins: { x: 0, y: 0 },
    //   },
    // }}
    // // Features.
    // features={{
    //   // Enable / disable touch support.
    //   touch: true,
    //
    //   // Range selection.
    //   range: true,
    //
    //   // Configuration in case a selectable gets just clicked.
    //   singleTap: {
    //     // Enable single-click selection (Also disables range-selection via shift + ctrl).
    //     allow: true,
    //
    //     // 'native' (element was mouse-event target) or 'touch' (element visually touched).
    //     intersect: 'native',
    //   },
    // }}
    ...props,
  };
};

export function BlockSelectionArea(props: BlockSelectionAreaProps) {
  const componentProps = useBlockSelectionArea(props);

  return <SelectionArea {...componentProps} />;
}

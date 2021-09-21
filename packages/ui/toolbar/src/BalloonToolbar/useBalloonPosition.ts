import * as React from 'react';
import { usePopper } from 'react-popper';
import * as PopperJS from '@popperjs/core';
import { getSelectionText, isSelectionExpanded, TEditor } from '@udecode/plate';

const { useEffect, useState, useCallback } = React;

const virtualReference: PopperJS.VirtualElement = {
  getBoundingClientRect() {
    return {
      top: 10,
      left: 10,
      bottom: 20,
      right: 100,
      width: 90,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => null,
    };
  },
};

export const usePopupPosition = ({
  editor,
  popupElem,
  scrollContainer = document.documentElement,
}: {
  editor?: TEditor;
  popupElem: HTMLElement | null;
  scrollContainer?: HTMLElement | null;
}): [
  { [key: string]: React.CSSProperties },
  {
    [key: string]:
      | {
          [key: string]: string;
        }
      | undefined;
  },
  boolean
] => {
  const [isHide, setIsHide] = useState(true);

  const selectionExpanded = editor && isSelectionExpanded(editor);
  const selectionText = editor && getSelectionText(editor);

  const { styles, attributes, update } = usePopper(
    virtualReference,
    popupElem,
    {
      placement: 'top',
      modifiers: [
        {
          name: 'preventOverflow',
          enabled: true,
          options: { boundary: scrollContainer ?? undefined },
        },
        {
          name: 'flip',
          enabled: true,
          options: { padding: 8 },
        },
        {
          name: 'eventListeners',
          enabled: true,
          options: { scroll: !isHide, resize: true },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
      strategy: 'absolute',
    }
  );

  const show = useCallback(() => {
    if (isHide && selectionExpanded) {
      setIsHide(false);
    }
  }, [isHide, selectionExpanded, setIsHide]);

  useEffect(() => {
    if (!selectionText) {
      setIsHide(true);
    } else if (selectionText && selectionExpanded) {
      setIsHide(false);
    }
  }, [selectionText, show, selectionExpanded, setIsHide]);

  const setPosition = useCallback(() => {
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount < 1) return;

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    virtualReference.getBoundingClientRect = () => rect;
    update?.();
  }, [update]);

  useEffect(() => {
    scrollContainer?.addEventListener('scroll', () => {
      setPosition();
    });
  }, [setPosition, scrollContainer]);

  useEffect(() => {
    popupElem && selectionExpanded && setPosition();
  }, [selectionText?.length, selectionExpanded, popupElem, setPosition]);

  return [
    {
      ...styles,
      popper: {
        ...styles.popper,
        // display: isHide ? 'none' : undefined,
      },
    },
    attributes,
    isHide,
  ];
};

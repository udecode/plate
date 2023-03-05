import React from 'react';
import { DragIndicator } from '@styled-icons/material/DragIndicator';
import Tippy, { TippyProps } from '@tippyjs/react';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
} from '@udecode/plate';
import { withPlateDraggables } from '@udecode/plate-ui-dnd';

const styles = {
  grabber: { fontSize: 12 },
  grabberText: { color: 'rgba(255, 255, 255, 0.45)' },
  dragButton: {
    width: 18,
    height: 18,
    color: 'rgba(55, 53, 47, 0.3)',
  },
};

const GrabberTooltipContent = () => (
  <div style={styles.grabber}>
    <div>
      Drag <span style={styles.grabberText}>to move</span>
    </div>
  </div>
);

export const grabberTooltipProps: TippyProps = {
  content: <GrabberTooltipContent />,
  placement: 'bottom',
  arrow: false,
  offset: [0, 0],
  delay: [300, 0],
  duration: [0, 0],
  hideOnClick: true,
  theme: 'small',
};

export const withStyledDraggables = (components: any) => {
  return withPlateDraggables(components, [
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      level: 0,
    },
    {
      keys: [
        ELEMENT_PARAGRAPH,
        ELEMENT_BLOCKQUOTE,
        ELEMENT_TODO_LI,
        ELEMENT_H1,
        ELEMENT_H2,
        ELEMENT_H3,
        ELEMENT_H4,
        ELEMENT_H5,
        ELEMENT_H6,
        ELEMENT_IMAGE,
        ELEMENT_OL,
        ELEMENT_UL,
        ELEMENT_TABLE,
        ELEMENT_MEDIA_EMBED,
        ELEMENT_CODE_BLOCK,
      ],
      draggableProps: {
        onRenderDragHandle: () => {
          return (
            <Tippy {...grabberTooltipProps}>
              <button type="button" className="drag-button">
                <DragIndicator style={styles.dragButton} />
              </button>
            </Tippy>
          );
        },
      },
    },
    {
      key: ELEMENT_H1,
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '2em 0 4px',
            fontSize: '1.875em',
          },
          blockToolbarWrapper: {
            height: '1.3em',
          },
        },
      },
    },
    {
      key: ELEMENT_H2,
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '1.4em 0 1px',
            fontSize: '1.5em',
          },
          blockToolbarWrapper: {
            height: '1.3em',
          },
        },
      },
    },
    {
      key: ELEMENT_H3,
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '1em 0 1px',
            fontSize: '1.25em',
          },
          blockToolbarWrapper: {
            height: '1.3em',
          },
        },
      },
    },
    {
      keys: [ELEMENT_H4, ELEMENT_H5, ELEMENT_H6],
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '0.75em 0 0',
            fontSize: '1.1em',
          },
          blockToolbarWrapper: {
            height: '1.3em',
          },
        },
      },
    },
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '4px 0 0',
          },
        },
      },
    },
    {
      key: ELEMENT_BLOCKQUOTE,
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '18px 0 0',
          },
        },
      },
    },
    {
      key: ELEMENT_CODE_BLOCK,
      draggableProps: {
        styles: {
          gutterLeft: {
            padding: '12px 0 0',
          },
        },
      },
    },
  ]);
};

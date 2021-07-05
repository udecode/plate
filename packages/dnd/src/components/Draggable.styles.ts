import { createStyles } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';
import { DraggableStyleProps } from './Draggable.types';

export const getDraggableStyles = (props: DraggableStyleProps) =>
  createStyles(
    { prefixClassNames: 'Draggable', ...props },
    {
      root: [
        {
          position: 'relative',
          opacity: props.isDragging ? 0.5 : 1,
          backgroundColor: props.selected ? 'rgb(181, 215, 255)' : undefined,
        },
        css`
          :hover .slate-Draggable-gutterLeft {
            opacity: 1;
          }
        `,
      ],

      block: {
        overflow: 'auto',
      },
      gutterLeft: [
        {
          position: 'absolute',
          top: 0,
          transform: 'translateX(-100%)',
          display: 'flex',
          height: '100%',
          opacity: 0,
        },
      ],

      blockToolbarWrapper: {
        display: 'flex',
        height: '1.5em',
      },
      blockToolbar: {
        marginRight: 4,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
      },
      dragHandle: {
        minWidth: 18,
        height: 18,
        padding: 0,
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        border: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        outline: 'none',
      },
      dropLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: props.direction === 'top' ? -1 : undefined,
        bottom: props.direction === 'bottom' ? -1 : undefined,
        height: 2,
        opacity: 1,
        background: '#B4D5FF',
      },
    }
  );

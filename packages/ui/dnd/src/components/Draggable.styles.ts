import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { DraggableStyleProps } from './Draggable.types';

export const getDraggableStyles = <V extends Value>(
  props: DraggableStyleProps<V>
) =>
  createStyles(
    { prefixClassNames: 'Draggable', ...props },
    {
      root: [
        tw`relative`,
        props.isDragging && tw`opacity-50`,
        props.selected && tw`backgroundColor[rgb(181, 215, 255)]`,
        css`
          :hover .slate-Draggable-gutterLeft {
            ${tw`opacity-100`}
          }
        `,
      ],

      block: tw`overflow-auto`,
      gutterLeft: [
        tw`absolute top-0 flex h-full opacity-0`,
        css`
          transform: translateX(-100%);
        `,
      ],

      blockToolbarWrapper: tw`flex height[1.5em]`,
      blockToolbar: tw`flex items-center mr-1 pointer-events-auto`,
      dragHandle: [
        tw`p-0 bg-transparent bg-no-repeat cursor-pointer overflow-hidden outline-none border-none`,
        tw`minWidth[18px] height[18px]`,
      ],
      dropLine: [
        tw`absolute left-0 right-0 h-0.5 opacity-100`,
        tw`background[#B4D5FF]`,
        props.direction === 'top' && tw`-top-px`,
        props.direction === 'bottom' && tw`-bottom-px`,
      ],
    }
  );

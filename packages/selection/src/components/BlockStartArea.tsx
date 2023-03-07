import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export interface BlockStartAreaProps extends HTMLPropsAs<'div'> {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  size?: string | number;
}

export const useBlockStartArea = ({
  placement = 'left',
  size = 'auto',
  ...props
}: BlockStartAreaProps): HTMLPropsAs<'div'> => {
  return {
    ...props,
    className: `slate-start-area slate-start-area-${placement}`,
    style: {
      position: 'absolute',
      top: ['top', 'left', 'right'].includes(placement) ? 0 : undefined,
      left: ['top', 'left', 'bottom'].includes(placement) ? 0 : undefined,
      bottom: ['bottom'].includes(placement) ? 0 : undefined,
      right: ['right'].includes(placement) ? 0 : undefined,
      width: ['left', 'right'].includes(placement) ? size : '100%',
      height: ['top', 'bottom'].includes(placement) ? size : '100%',
      zIndex: 1,
      userSelect: 'none',
      cursor: 'text',
      ...props?.style,
    },
  };
};

export const BlockStartArea = createComponentAs<BlockStartAreaProps>((props) =>
  createElementAs('div', useBlockStartArea(props))
);

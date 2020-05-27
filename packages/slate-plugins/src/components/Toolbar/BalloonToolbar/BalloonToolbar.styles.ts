import { concatStyleSets, IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject, memoizeFunction } from '@uifabric/utilities';
import {
  BalloonToolbarStyleProps,
  BalloonToolbarStyles,
} from 'components/Toolbar/BalloonToolbar/BalloonToolbar.types';

const classNames = {
  root: 'slate-BalloonToolbar',
};

export const getBalloonToolbarStyles = memoizeFunction(
  (
    className?: string,
    styles?: IStyleFunctionOrObject<
      BalloonToolbarStyleProps,
      BalloonToolbarStyles
    >,
    hidden?: boolean,
    hiddenDelay?: number,
    direction?: 'top' | 'bottom',
    arrow?: boolean
  ): BalloonToolbarStyles => {
    const background = 'rgb(36, 42, 49)';

    let arrowStyle: IStyle = {};

    if (arrow) {
      arrowStyle = {
        left: '50%',
        content: '" "',
        position: 'absolute',
        transform: 'translateX(-50%)',
        marginTop: '-1px',
        borderColor: `${background} transparent`,
        borderTopColor: background,
        borderRightColor: 'transparent',
        borderBottomColor: background,
        borderLeftColor: 'transparent',
        borderStyle: 'solid',
      };
    }

    let marginTop;
    if (direction === 'top') {
      arrowStyle = {
        ...arrowStyle,
        top: '100%',
        bottom: 'auto',
        borderWidth: '8px 8px 0px',
      };
      marginTop = -12;
    } else {
      arrowStyle = {
        ...arrowStyle,
        top: 'auto',
        bottom: '100%',
        borderWidth: '0px 8px 8px',
      };
      marginTop = -16;
    }

    return concatStyleSets(
      {
        root: [
          classNames.root,
          {
            position: 'absolute',
            zIndex: 500,

            background,
            color: 'rgb(157, 170, 182)',

            whiteSpace: 'nowrap',
            visibility: 'hidden',
            borderRadius: 4,
            padding: '0 4px',
            marginTop,
            transition: hiddenDelay
              ? ''
              : 'top 75ms ease-out,left 75ms ease-out',

            selectors: {
              '::after': arrowStyle,
            },
          },
          !hidden && {
            visibility: 'visible',
          },
          className,
        ],
      },
      styles
    );
  }
);

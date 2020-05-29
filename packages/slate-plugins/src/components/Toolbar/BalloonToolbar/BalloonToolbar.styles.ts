import { concatStyleSets, IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject, memoizeFunction } from '@uifabric/utilities';
import {
  BalloonToolbarStyleProps,
  BalloonToolbarStyles,
} from './BalloonToolbar.types';

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
    theme?: BalloonToolbarStyleProps['theme'],
    hidden?: BalloonToolbarStyleProps['hidden'],
    hiddenDelay?: BalloonToolbarStyleProps['hiddenDelay'],
    direction?: BalloonToolbarStyleProps['direction'],
    arrow?: BalloonToolbarStyleProps['arrow']
  ): BalloonToolbarStyles => {
    let color = 'rgb(157, 170, 182)';
    let colorActive = 'white';
    let background = 'rgb(36, 42, 49)';
    let borderColor = 'transparent';

    if (theme === 'light') {
      color = 'rgba(0, 0, 0, 0.50)';
      colorActive = 'black';
      background = 'rgb(250, 250, 250)';
      borderColor = 'rgb(196, 196, 196)';
    }

    let marginTop;
    let arrowStyle: IStyle = {};
    let arrowBorderStyle: IStyle = {};

    if (arrow) {
      arrowStyle = {
        left: '50%',
        content: '" "',
        position: 'absolute',
        marginTop: '-1px',
        transform: 'translateX(-50%)',
        borderColor: `${background} transparent`,
        borderStyle: 'solid',
      };

      if (direction === 'top') {
        arrowStyle = {
          ...arrowStyle,
          top: '100%',
          bottom: 'auto',
          borderWidth: '8px 8px 0px',
        };

        if (theme === 'light') {
          arrowBorderStyle = {
            ...arrowStyle,
            marginTop: 0,
            borderWidth: '9px 9px 0px',
            borderColor: `${borderColor} transparent`,
          };
        }
      } else {
        arrowStyle = {
          ...arrowStyle,
          top: 'auto',
          bottom: '100%',
          borderWidth: '0px 8px 8px',
        };

        if (theme === 'light') {
          arrowBorderStyle = {
            ...arrowStyle,
            marginTop: 0,
            borderWidth: '0px 9px 9px',
            borderColor: `${borderColor} transparent`,
          };
        }
      }
    }

    if (direction === 'top') {
      marginTop = -9;
    } else {
      marginTop = 9;
    }

    return concatStyleSets(
      {
        root: [
          classNames.root,
          {
            position: 'absolute',
            zIndex: 500,

            background,
            color,

            whiteSpace: 'nowrap',
            visibility: 'hidden',
            border: 'solid #000',
            borderRadius: 4,
            borderWidth: 1,
            borderColor,
            padding: '0 4px',
            marginTop,
            transition: hiddenDelay
              ? ''
              : 'top 75ms ease-out,left 75ms ease-out',

            selectors: {
              '::before': arrowBorderStyle,
              '::after': arrowStyle,
              '.slate-ToolbarButton-active, .slate-ToolbarButton:hover': {
                color: colorActive,
              },
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

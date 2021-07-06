import { createStyles } from '@udecode/slate-plugins-ui';
import { css, CSSProp } from 'styled-components';
import tw from 'twin.macro';
import { getToolbarStyles } from '../Toolbar/Toolbar.styles';
import { BalloonToolbarStyleProps } from './BalloonToolbar.types';

export const getBalloonToolbarStyles = (props: BalloonToolbarStyleProps) => {
  let color = 'rgb(157, 170, 182)';
  let colorActive = 'white';
  let background = 'rgb(36, 42, 49)';
  let borderColor = 'transparent';

  if (props.theme === 'light') {
    color = 'rgba(0, 0, 0, 0.50)';
    colorActive = 'black';
    background = 'rgb(250, 250, 250)';
    borderColor = 'rgb(196, 196, 196)';
  }

  let marginTop;
  let arrowStyle: CSSProp = {};
  let arrowBorderStyle: CSSProp = {};

  if (props.arrow) {
    arrowStyle = {
      left: '50%',
      content: '" "',
      position: 'absolute',
      marginTop: '-1px',
      transform: 'translateX(-50%)',
      borderColor: `${background} transparent`,
      borderStyle: 'solid',
    };

    if (props.direction === 'top') {
      arrowStyle = {
        ...arrowStyle,
        top: '100%',
        bottom: 'auto',
        borderWidth: '8px 8px 0px',
      };

      if (props.theme === 'light') {
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

      if (props.theme === 'light') {
        arrowBorderStyle = {
          ...arrowStyle,
          marginTop: 0,
          borderWidth: '0px 9px 9px',
          borderColor: `${borderColor} transparent`,
        };
      }
    }
  }

  if (props.direction === 'top') {
    marginTop = -9;
  } else {
    marginTop = 9;
  }

  return createStyles(
    { prefixClassNames: 'BalloonToolbar', ...props },
    {
      root: [
        ...getToolbarStyles(props).root.css,
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
          transition: props.hiddenDelay
            ? ''
            : 'top 75ms ease-out,left 75ms ease-out',

          '::before': arrowBorderStyle,
          '::after': arrowStyle,
        },
        css`
          .slate-ToolbarButton-active,
          .slate-ToolbarButton:hover {
            color: ${colorActive};
          }
        `,
        !props.hidden && tw`visible`,
      ],
    }
  );
};

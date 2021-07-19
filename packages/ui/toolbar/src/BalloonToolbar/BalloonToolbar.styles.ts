import { createStyles } from '@udecode/plate-styled-components';
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
  const arrowStyle: CSSProp = [
    props.arrow &&
      css`
        ::after {
          left: 50%;
          content: ' ';
          position: absolute;
          margin-top: -1px;
          transform: translateX(-50%);
          border-color: ${background} transparent;
          border-style: solid;
        }
      `,

    props.arrow &&
      props.direction === 'top' &&
      css`
        ::after {
          top: 100%;
          bottom: auto;
          border-width: 8px 8px 0;
        }
      `,

    props.arrow &&
      props.direction !== 'top' &&
      css`
        ::after {
          top: auto;
          bottom: 100%;
          border-width: 0 8px 8px;
        }
      `,
  ];

  const arrowBorderStyle: CSSProp = [
    props.arrow &&
      props.direction === 'top' &&
      props.theme === 'light' &&
      css`
        ::before {
          margin-top: 0;
          border-width: 9px 9px 0;
          border-color: ${borderColor} transparent;
        }
      `,
    props.arrow &&
      props.direction !== 'top' &&
      props.theme === 'light' &&
      css`
        ::before {
          margin-top: 0;
          border-width: 0 9px 9px;
          border-color: ${borderColor} transparent;
        }
      `,
  ];

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
        tw`absolute whitespace-nowrap py-0 px-1`,
        props.hidden && tw`invisible`,
        !props.hiddenDelay &&
          tw`transition[top 75ms ease-out,left 75ms ease-out]`,
        css`
          color: ${color};
          background: ${background};
          z-index: 500;
          border: 1px solid ${borderColor};
          border-radius: 4px;
          margin-top: ${marginTop}px;

          .slate-ToolbarButton-active,
          .slate-ToolbarButton:hover {
            color: ${colorActive};
          }

          ::before {
            ${arrowBorderStyle}
          }
        `,
        ...arrowStyle,
        ...arrowBorderStyle,
      ],
    }
  );
};

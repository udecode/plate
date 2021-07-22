import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { getToolbarStyles } from '../Toolbar/Toolbar.styles';

export const getHeadingToolbarStyles = (props: StyledProps) =>
  createStyles({ prefixClassNames: 'HeadingToolbar', ...props }, [
    {
      root: [
        ...getToolbarStyles(props).root.css,
        tw`relative flex-wrap mt-0 mb-5 -mx-5`,
        css`
          padding: 1px 18px 17px;
          border-bottom: 2px solid #eee;

          .slate-ToolbarButton-active,
          .slate-ToolbarButton:hover {
            color: #06c;
          }
        `,
      ],
    },
  ]);

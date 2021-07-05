import { createStyles, StyledProps } from '@udecode/slate-plugins-ui';
import { css } from 'styled-components';
import { getToolbarStyles } from '../Toolbar/Toolbar.styles';

export const getHeadingToolbarStyles = (props: StyledProps) =>
  createStyles({ prefixClassNames: 'HeadingToolbar', ...props }, [
    {
      root: [
        ...getToolbarStyles(props).root.css,
        {
          position: 'relative',
          padding: '1px 18px 17px',
          margin: '0 -20px',
          borderBottom: '2px solid #eee',
          marginBottom: '20px',
          flexWrap: 'wrap',
        },
        css`
          .slate-ToolbarButton-active,
          .slate-ToolbarButton:hover {
            color: #06c;
          }
        `,
      ],
    },
  ]);

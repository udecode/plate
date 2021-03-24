import { RootStyleSet } from '@udecode/slate-plugins-ui-fluent';
import { ToolbarButtonStyleProps } from './ToolbarButton.types';

const classNames = {
  root: 'slate-ToolbarButton',
  active: 'slate-ToolbarButton-active',
};

export const getToolbarButtonStyles = ({
  className,
  active,
}: ToolbarButtonStyleProps = {}): RootStyleSet => ({
  root: [
    classNames.root,
    {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '28px',
      height: '24px',
      userSelect: 'none',
      cursor: 'pointer',
      verticalAlign: 'middle',

      selectors: {
        '> svg': {
          display: 'block',
          width: '20px',
          height: '20px',
        },
      },
    },
    active && classNames.active,
    className,
  ],
});

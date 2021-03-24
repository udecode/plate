import {
  ClassName,
  RootStyleSet,
  Styles,
} from '@udecode/slate-plugins-ui-fluent';
import { concatStyleSets } from '@uifabric/styling';
import { getToolbarStyles } from '../Toolbar/Toolbar.styles';

const classNames = {
  root: 'slate-HeadingToolbar',
};

export const getHeadingToolbarStyles = ({
  className,
}: ClassName = {}): Styles => {
  const color = '#06c';

  const styles: RootStyleSet = {
    root: [
      classNames.root,
      {
        position: 'relative',
        padding: '1px 18px 17px',
        margin: '0 -20px',
        borderBottom: '2px solid #eee',
        marginBottom: '20px',
        flexWrap: 'wrap',

        selectors: {
          '.slate-ToolbarButton-active, .slate-ToolbarButton:hover': {
            color,
          },
        },
      },
      className,
    ],
  };

  return concatStyleSets(getToolbarStyles(), styles);
};

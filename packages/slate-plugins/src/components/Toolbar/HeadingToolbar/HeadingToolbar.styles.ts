import { concatStyleSets } from '@uifabric/styling';
import { getToolbarStyles } from 'components/Toolbar/Toolbar.styles';
import {
  ToolbarStyleProps,
  ToolbarStyles,
} from 'components/Toolbar/Toolbar.types';

const classNames = {
  root: 'slate-HeadingToolbar',
};

export const getHeadingToolbarStyles = ({
  className,
}: ToolbarStyleProps = {}): ToolbarStyles => {
  const styles: ToolbarStyles = {
    root: [
      classNames.root,
      {
        position: 'relative',
        padding: '1px 18px 17px',
        margin: '0 -20px',
        borderBottom: '2px solid #eee',
        marginBottom: '20px',
      },
      className,
    ],
  };

  return concatStyleSets(getToolbarStyles(), styles);
};

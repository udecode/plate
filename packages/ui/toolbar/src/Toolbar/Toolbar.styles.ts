import { Styles } from '@udecode/slate-plugins-ui-fluent';
import { concatStyleSets } from '@uifabric/styling';
import { memoizeFunction } from '@uifabric/utilities';

const classNames = {
  root: 'slate-Toolbar',
};

export const getToolbarStyles = memoizeFunction((styles?: Styles) => {
  return concatStyleSets(
    {
      root: [
        classNames.root,
        {
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'content-box',
          userSelect: 'none',
          minHeight: 40,
          color: 'rgb(68, 68, 68)',
        },
      ],
    },
    styles
  );
});

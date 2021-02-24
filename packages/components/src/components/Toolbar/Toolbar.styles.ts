import { concatStyleSets } from '@uifabric/styling';
import { IStyleFunctionOrObject, memoizeFunction } from '@uifabric/utilities';
import { ToolbarStyleProps, ToolbarStyles } from './Toolbar.types';

const classNames = {
  root: 'slate-Toolbar',
};

export const getToolbarStyles = memoizeFunction(
  (styles?: IStyleFunctionOrObject<ToolbarStyleProps, ToolbarStyles>) => {
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
  }
);

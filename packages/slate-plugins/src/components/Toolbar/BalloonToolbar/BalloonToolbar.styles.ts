import { concatStyleSets } from '@uifabric/styling';
import { IStyleFunctionOrObject, memoizeFunction } from '@uifabric/utilities';
import {
  BalloonToolbarStyleProps,
  BalloonToolbarStyles,
} from 'components/Toolbar/BalloonToolbar/BalloonToolbar.types';

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
    hidden?: boolean,
    hiddenDelay?: number,
    direction?: 'top' | 'bottom'
  ): BalloonToolbarStyles => {
    return concatStyleSets(
      {
        root: [
          classNames.root,
          {
            position: 'absolute',
            zIndex: 500,

            whiteSpace: 'nowrap',
            padding: '8px 7px 6px',
            marginTop: direction === 'top' ? -6 : -12,
            backgroundColor: '#222',
            borderRadius: 4,
            visibility: 'hidden',
            transition: hiddenDelay
              ? ''
              : 'top 75ms ease-out,left 75ms ease-out',
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

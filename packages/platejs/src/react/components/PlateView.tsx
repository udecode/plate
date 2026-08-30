import React, { useCallback } from 'react';

import { type PlateStaticProps, PlateStatic } from '../../static';
import { writeStaticSelectionClipboardData } from '../../static/internal/writeStaticSelectionClipboardData';

export type PlateViewProps<E = PlateStaticProps['editor']> =
  PlateStaticProps<E>;

export const PlateView = <E,>(props: PlateViewProps<E>) => (
  <PlateStatic
    onCopy={useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        if (
          writeStaticSelectionClipboardData(
            props.editor as PlateStaticProps['editor'],
            e.clipboardData
          )
        ) {
          e.preventDefault();
        }
      },
      [props.editor]
    )}
    {...props}
  />
);

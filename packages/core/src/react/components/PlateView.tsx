import React, { useCallback } from 'react';

import { type PlateStaticProps, PlateStatic } from '../../static';
import { writeStaticSelectionClipboardData } from '../../static/internal/writeStaticSelectionClipboardData';

export type PlateViewProps = PlateStaticProps;

export const PlateView = (props: PlateViewProps) => (
  <PlateStatic
    onCopy={useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        if (writeStaticSelectionClipboardData(props.editor, e.clipboardData)) {
          e.preventDefault();
        }
      },
      [props.editor]
    )}
    {...props}
  />
);

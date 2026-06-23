import React, { useCallback } from 'react';

import { getCurrentRuntimeTransforms } from '../../internal/currentRuntimeBridge';
import { type PlateStaticProps, PlateStatic } from '../../static';

export type PlateViewProps = PlateStaticProps & {};

export const PlateView = (props: PlateViewProps) => (
  <PlateStatic
    onCopy={useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        getCurrentRuntimeTransforms(props.editor).setFragmentData(
          e.clipboardData,
          'copy'
        );
        if (e.clipboardData.getData('application/x-slate-fragment')) {
          e.preventDefault();
        }
      },
      [props.editor]
    )}
    {...props}
  />
);

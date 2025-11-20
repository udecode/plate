import React, { useCallback } from 'react';

import { type PlateStaticProps, PlateStatic } from '../../static';

export type PlateViewProps = PlateStaticProps & {};

export const PlateView = (props: PlateViewProps) => (
  <PlateStatic
    onCopy={useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        props.editor.tf.setFragmentData(e.clipboardData, 'copy');
        if (e.clipboardData.getData('application/x-slate-fragment')) {
          e.preventDefault();
        }
      },
      [props.editor.tf]
    )}
    {...props}
  />
);

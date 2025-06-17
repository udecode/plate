import type React from 'react';

export type RenderChunkFn = (
  props: RenderChunkProps
) => React.ReactElement<any>;

export interface RenderChunkProps {
  attributes: {
    'data-slate-chunk': true;
  };
  children: any;
  highest: boolean;
  lowest: boolean;
}

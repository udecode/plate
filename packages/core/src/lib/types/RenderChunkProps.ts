import type React from 'react';

export type RenderChunkFn = (
  props: RenderChunkProps
) => React.ReactElement<any>;

export type RenderChunkProps = {
  attributes: {
    'data-plite-chunk': true;
  };
  children: any;
  highest: boolean;
  lowest: boolean;
};

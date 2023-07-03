import React from 'react';
import { Value } from '@udecode/slate';

import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';

export type SerializeHtml<V extends Value = Value> = React.FC<
  PlateRenderElementProps<V> & PlateRenderLeafProps<V>
>;

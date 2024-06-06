import type React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';
import type { PlateRenderLeafProps } from '../PlateRenderLeafProps';

export type SerializeHtml<V extends Value = Value> = React.FC<
  PlateRenderElementProps<V> & PlateRenderLeafProps<V>
>;

import type React from 'react';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';
import type { PlateRenderLeafProps } from '../PlateRenderLeafProps';

export type SerializeHtml<O = {}, A = {}, T = {}, S = {}> = React.FC<
  PlateRenderElementProps<O, A, T, S> & PlateRenderLeafProps<O, A, T, S>
>;

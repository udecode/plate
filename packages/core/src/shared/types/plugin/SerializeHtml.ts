import type React from 'react';

import type { PlateRenderElementProps } from '../PlateRenderElementProps';
import type { PlateRenderLeafProps } from '../PlateRenderLeafProps';

export type SerializeHtml = React.FC<
  PlateRenderElementProps & PlateRenderLeafProps
>;

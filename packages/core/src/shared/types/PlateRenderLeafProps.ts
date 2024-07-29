import type { TRenderLeafProps } from '@udecode/slate-react';

import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps = PlateRenderNodeProps & TRenderLeafProps;

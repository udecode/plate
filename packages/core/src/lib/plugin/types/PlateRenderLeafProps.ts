import type { TText } from '@udecode/slate';
import type { TRenderLeafProps } from '@udecode/slate-react';

import type { AnyEditorPlugin } from './PlatePlugin';
import type { PlateRenderNodeProps } from './PlateRenderNodeProps';

/** Leaf props passed by Plate */
export type PlateRenderLeafProps<
  N extends TText = TText,
  P extends AnyEditorPlugin = AnyEditorPlugin,
> = PlateRenderNodeProps<P> & TRenderLeafProps<N>;

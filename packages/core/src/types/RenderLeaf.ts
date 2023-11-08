import { Value } from '@udecode/slate';

import { PlateRenderLeafProps } from './PlateRenderLeafProps';

/**
 * Function used to render the children of a leaf.
 * If the function returns undefined then the next RenderLeaf function is called and the current children are not modified.
 * The children passed to the function may be the result of a previous plugin.
 * To wrap the previous plugin simply return the passed children.
 * You do not need to add the attributes to your return value.
 * The attributes are added by default.
 * RenderLeaf always returns a JSX element (even if unmodified) to support multiple marks on a node.
 */
export type RenderLeaf = <V extends Value = Value>(
  props: PlateRenderLeafProps<V>
) => React.ReactElement;

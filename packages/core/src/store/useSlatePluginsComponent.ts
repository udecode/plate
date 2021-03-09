import { useCallback } from 'react';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const abc = 1;

// export const useSlatePluginsComponent = <TNodeType extends string>(
//   nodeType: TNodeType,
//   id = 'main'
// ) =>
//   useSlatePluginsStore(
//     useCallback((state) => state.byId[id]?.components[nodeType], [id, nodeType])
//   );

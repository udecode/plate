import { useContext } from 'react';

import { PliteDOMStrategyVirtualOffsetContext } from '../context';

/**
 * Returns the vertical document offset for the current virtualized top-level
 * row. Layout renderers subtract this value from absolute layout coordinates
 * when painting projected content inside a DOM virtualization window.
 */
export const useDOMStrategyVirtualOffset = () =>
  useContext(PliteDOMStrategyVirtualOffsetContext);

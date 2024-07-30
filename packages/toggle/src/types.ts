import type { SetStateAction } from 'react';

import type { buildToggleIndex } from './toggle-controller-store';

export interface TogglePluginOptions {
  // Options would go here
  // TODO a JOTAI layer in plate-core instead of relying on plugin options
  openIds?: Set<string>;
  setOpenIds?: (args_0: SetStateAction<Set<string>>) => void;
  toggleIndex?: ReturnType<typeof buildToggleIndex>;
}

export const ELEMENT_TOGGLE = 'toggle';

export type TToggleElement = {
  type: typeof ELEMENT_TOGGLE;
};

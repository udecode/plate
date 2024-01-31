import { SetStateAction } from 'react';

import { buildToggleIndex } from './toggle-controller-store';

export interface TogglePlugin {
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

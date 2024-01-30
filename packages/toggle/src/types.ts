import { SetStateAction } from 'react';

export interface TogglePlugin {
  // Options would go here
  // TODO a JOTAI layer instead of relying on plugin options
  openIds: Set<string>;
  setOpenIds: (args_0: SetStateAction<Set<string>>) => void;
}

export const ELEMENT_TOGGLE = 'toggle';

export type TToggleElement = {
  type: typeof ELEMENT_TOGGLE;
};

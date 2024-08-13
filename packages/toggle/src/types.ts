import type { SetStateAction } from 'react';

import type { TogglePlugin } from './TogglePlugin';
import type { buildToggleIndex } from './toggle-controller-store';

export interface TogglePluginOptions {
  // Options would go here
  // TODO a JOTAI layer in plate-core instead of relying on plugin options
  openIds?: Set<string>;
  setOpenIds?: (args_0: SetStateAction<Set<string>>) => void;
  toggleIndex?: ReturnType<typeof buildToggleIndex>;
}

export type TToggleElement = {
  type: typeof TogglePlugin.key;
};

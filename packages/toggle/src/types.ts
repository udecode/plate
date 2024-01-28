import { ToggleStore } from './store';

export interface TogglePlugin {
  // Options would go here
}

export const ELEMENT_TOGGLE = 'toggle';

export type ToggleEditor = {
  toggleStore: ToggleStore;
};

export type TToggleElement = {
  type: typeof ELEMENT_TOGGLE;
};

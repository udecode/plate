import { pliteToPlateCodemod } from './transforms/plite-to-plate';
import type { CodemodDefinition } from './types';

export const CODEMODS: readonly CodemodDefinition[] = [pliteToPlateCodemod];

export const getCodemod = (id: string): CodemodDefinition | undefined =>
  CODEMODS.find((codemod) => codemod.id === id);

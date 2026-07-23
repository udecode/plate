import { createAtomStore } from '@platejs/core/react/internal';

export const { PlaceholderProvider } = createAtomStore(
  {},
  { name: 'placeholder' as const }
);

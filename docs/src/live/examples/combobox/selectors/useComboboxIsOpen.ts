import { useComboboxStore } from '../useComboboxStore';

export const useComboboxIsOpen = () =>
  // useComboboxStore((state) => !!state.targetRange && state.items.length > 0);
  useComboboxStore((state) => !!state.targetRange);

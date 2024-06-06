import { useBlockSelectionSelectors } from '../blockSelectionStore';

export const useBlockSelected = (id?: string) => {
  return useBlockSelectionSelectors().isSelected(id);
};

export const useHasBlockSelected = () => {
  return useBlockSelectionSelectors().selectedIds().size > 0;
};

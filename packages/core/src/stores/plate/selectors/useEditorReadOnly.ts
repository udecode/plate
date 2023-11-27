import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Whether the editor is read-only.
 * You can also use `useReadOnly` from `slate-react` in node components.
 */
export const useEditorReadOnly = (id?: PlateId) => {
  return usePlateSelectors().readOnly({ scope: id });
};

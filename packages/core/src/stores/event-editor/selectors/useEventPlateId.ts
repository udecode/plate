import { usePlateId } from '../../../atoms/plateIdAtom';
import { useEventEditorId } from './useEventEditorId';

export const useEventPlateId = (id?: string, scope?: string) => {
  const plateId = usePlateId(scope);
  const eventEditorId = useEventEditorId();

  return id ?? plateId ?? eventEditorId ?? 'main';
};

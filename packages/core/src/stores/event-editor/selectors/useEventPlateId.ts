import { usePlateId } from '../../../atoms/plateIdAtom';
import { useEventEditorId } from './useEventEditorId';

export const useEventPlateId = (id?: string) => {
  const plateId = usePlateId();
  const eventEditorId = useEventEditorId();

  return id ?? plateId ?? eventEditorId ?? 'main';
};

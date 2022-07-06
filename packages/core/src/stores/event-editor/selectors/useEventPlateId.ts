import { usePlateId } from '../../../atoms/plateIdAtom';
import { Scope } from '../../../utils/index';
import { useEventEditorId } from './useEventEditorId';

export const useEventPlateId = (id?: string, scope?: Scope) => {
  const plateId = usePlateId(scope);
  const eventEditorId = useEventEditorId();

  return id ?? plateId ?? eventEditorId ?? 'main';
};

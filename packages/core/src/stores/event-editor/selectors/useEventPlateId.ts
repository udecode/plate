import { PLATE_SCOPE, PlateId, usePlateSelectors } from '../../plate/index';
import { useEventEditorSelectors } from '../event-editor.store';

/**
 * Get last event editor id: focus, blur or last.
 */
export const useEventPlateId = (id?: PlateId) => {
  const focus = useEventEditorSelectors.focus();
  const blur = useEventEditorSelectors.blur();
  const last = useEventEditorSelectors.last();
  const providerId = usePlateSelectors().id();

  if (id) return id;

  if (focus) return focus;
  if (blur) return blur;
  return last ?? providerId ?? PLATE_SCOPE;
};

import { useEventEditorSelectors } from '../../../../shared/plugins/event-editor/eventEditorStore';
import { PLATE_SCOPE, type PlateId, usePlateSelectors } from '../../plate';

/** Get last event editor id: focus, blur or last. */
export const useEventPlateId = (id?: PlateId) => {
  const focus = useEventEditorSelectors.focus();
  const blur = useEventEditorSelectors.blur();
  const last = useEventEditorSelectors.last();
  const providerId = usePlateSelectors().editor().id;

  if (id) return id;
  if (focus) return focus;
  if (blur) return blur;

  return last ?? providerId ?? PLATE_SCOPE;
};

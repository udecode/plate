import { useEventEditorSelectors } from '../../../lib/plugins/event-editor/eventEditorStore';
import { PLATE_SCOPE, usePlateSelectors } from '../plate';

/** Get last event editor id: focus, blur or last. */
export const useEventPlateId = (id?: string) => {
  const focus = useEventEditorSelectors.focus();
  const blur = useEventEditorSelectors.blur();
  const last = useEventEditorSelectors.last();
  const providerId = usePlateSelectors().editor().id;

  if (id) return id;
  if (focus) return focus;
  if (blur) return blur;

  return last ?? providerId ?? PLATE_SCOPE;
};

import { useEventEditorValue } from '../../plugins/event-editor/EventEditorStore';
import { PLATE_SCOPE, useEditorRef } from '../plate';

/** Get last event editor id: focus, blur or last. */
export const useEventPlateId = (id?: string) => {
  const focus = useEventEditorValue('focus');
  const blur = useEventEditorValue('blur');
  const last = useEventEditorValue('last');
  const providerId = useEditorRef().id;

  if (id) return id;
  if (focus) return focus;
  if (blur) return blur;

  return last ?? providerId ?? PLATE_SCOPE;
};

import { useEventEditorSelectors } from '../event-editor.store';

/**
 * Get last event editor id: focus, blur or last.
 */
export const useEventEditorId = () => {
  const focus = useEventEditorSelectors.focus();
  const blur = useEventEditorSelectors.blur();
  const last = useEventEditorSelectors.last();

  if (focus) return focus;
  if (blur) return blur;
  return last;
};

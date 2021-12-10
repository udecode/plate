import {
  eventEditorSelectors,
  useEventEditorSelectors,
} from '../../event-editor/event-editor.store';

/**
 * - Get the last focused editor id if any
 * - Else, get the last blurred editor id if any
 * - Else, get the last editor id if any
 * - Else, `null`
 */
export const getPlateId = (id?: string): string => {
  if (id) return id;

  const focus = eventEditorSelectors.focus?.();
  if (focus) return focus;

  const blur = eventEditorSelectors.blur?.();
  if (blur) return blur;

  const last = eventEditorSelectors.last?.();
  return last ?? 'main';
};

export const usePlateId = (id?: string): string => {
  const focus = useEventEditorSelectors.focus?.();
  const blur = useEventEditorSelectors.blur?.();
  const last = useEventEditorSelectors.last?.();

  if (id) return id;
  if (focus) return focus;
  if (blur) return blur;

  return last ?? 'main';
};

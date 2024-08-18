import { eventEditorSelectors } from './eventEditorStore';

export const getEventPlateId = (id?: string) => {
  if (id) return id;

  const focus = eventEditorSelectors.focus();

  if (focus) return focus;

  const blur = eventEditorSelectors.blur();

  if (blur) return blur;

  return eventEditorSelectors.last() ?? 'plate';
};

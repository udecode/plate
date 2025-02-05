import { EventEditorStore } from './EventEditorStore';

export const getEventPlateId = (id?: string) => {
  if (id) return id;

  const focus = EventEditorStore.get('focus');

  if (focus) return focus;

  const blur = EventEditorStore.get('blur');

  if (blur) return blur;

  return EventEditorStore.get('last') ?? 'plate';
};

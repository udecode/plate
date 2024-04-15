import { eventEditorSelectors } from './eventEditorStore';

import type { PlateId } from '../../client/stores/plate';

export const getEventPlateId = (id?: PlateId) => {
  if (id) return id;

  const focus = eventEditorSelectors.focus();
  if (focus) return focus;

  const blur = eventEditorSelectors.blur();
  if (blur) return blur;

  return eventEditorSelectors.last() ?? 'plate';
};

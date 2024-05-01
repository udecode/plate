import type { PlateId } from '../../../client/stores/plate';

import { eventEditorSelectors } from './eventEditorStore';

export const getEventPlateId = (id?: PlateId) => {
  if (id) return id;

  const focus = eventEditorSelectors.focus();

  if (focus) return focus;

  const blur = eventEditorSelectors.blur();

  if (blur) return blur;

  return eventEditorSelectors.last() ?? 'plate';
};

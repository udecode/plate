import { PLATE_SCOPE, PlateId } from '../../plate/index';
import { eventEditorSelectors } from '../event-editor.store';

export const getEventPlateId = (id?: PlateId) => {
  if (id) return id;

  const focus = eventEditorSelectors().focus();
  if (focus) return focus;

  const blur = eventEditorSelectors().blur();
  if (blur) return blur;

  return eventEditorSelectors().last() ?? PLATE_SCOPE;
};

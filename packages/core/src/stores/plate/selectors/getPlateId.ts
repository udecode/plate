import { getEventEditorState } from '../../event-editor/selectors/getEventEditorState';
import { plateStore } from '../plate.store';

/**
 * - Get the last focused editor id if any
 * - Else, get the last blurred editor id if any
 * - Else, get the first editor id if any
 * - Else, `null`
 */
export const getPlateId = (): string | null => {
  const { blur, focus } = getEventEditorState();
  if (focus) return focus;
  if (blur) return blur;

  const state = plateStore.getState();
  const keys = Object.keys(state);
  if (!keys.length) return null;

  return keys[0];
};

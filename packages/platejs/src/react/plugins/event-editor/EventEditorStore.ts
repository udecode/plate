import { createZustandStore } from '../../libs/zustand';

export const FOCUS_EDITOR_EVENT = 'focus-editor-event';

export const BLUR_EDITOR_EVENT = 'blur-editor-event';

export type EventEditorState = {
  /** Last editor id that has been blurred. */
  blur: string | null;
  /** Editor id that is currently being focused. */
  focus: string | null;
  /** Last editor id. */
  last: string | null;
};

/** Store where the keys are event names and the values are editor ids. */
const initialEventEditorState: EventEditorState = {
  blur: null,
  focus: null,
  last: null,
};

export const EventEditorStore = createZustandStore(initialEventEditorState, {
  mutative: true,
  name: 'event-editor',
});

export const getEventPlateId = (id?: string) => {
  if (id) return id;

  return (
    EventEditorStore.get('focus') ??
    EventEditorStore.get('blur') ??
    EventEditorStore.get('last') ??
    'plate'
  );
};

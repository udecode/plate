import { createZustandStore } from '../../../lib';

export type EventEditorState = {
  /** Last editor id that has been blurred. */
  blur: string | null;
  /** Editor id that is currently being focused. */
  focus: string | null;
  /** Last editor id. */
  last: string | null;
};

/** Store where the keys are event names and the values are editor ids. */
export const EventEditorStore = createZustandStore(
  {
    blur: null,
    focus: null,
    last: null,
  } as EventEditorState,
  {
    mutative: true,
    name: 'event-editor',
  }
);

export const { useValue: useEventEditorValue } = EventEditorStore;

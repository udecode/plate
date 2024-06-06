import { createZustandStore } from '@udecode/plate-common/server';

/**
 * The show action has depend on blockSelection store a lot. should I move this
 * action into blockSelection store?
 */
export const blockContextMenuStore = createZustandStore('contextMenu')({
  action: { group: null, value: null } as {
    group: null | string;
    value: null | string;
  } | null,
  anchorRect: { x: 0, y: 0 },
  openEditorId: null as null | string,
  store: null as any | null,
})
  .extendActions((set) => ({
    reset: () => {
      set.anchorRect({ x: 0, y: 0 });
    },
  }))
  .extendActions((set, get) => ({
    hide: () => {
      set.openEditorId(null);
      set.reset();
    },
    show: (
      editorId: string,
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      set.openEditorId(editorId);
      get.store().show();
      get.store().setAutoFocusOnShow(true);
      get.store().setInitialFocus('first');

      set.anchorRect({ x: event.clientX, y: event.clientY });
    },
  }))
  .extendSelectors((state) => ({
    isOpen: (editorId: string) => state.openEditorId === editorId,
  }));

export const blockContextMenuActions = blockContextMenuStore.set;

export const blockContextMenuSelectors = blockContextMenuStore.get;

export const useBlockContextMenuSelectors = () => blockContextMenuStore.use;

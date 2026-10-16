import type { YjsController } from './controller';
import {
  deleteActiveYjsController,
  setActiveYjsController,
} from './controller-registry';
import type { YjsEditor } from './editor-types';
import { isRecord } from './record';
import type {
  YjsAdmissionStatus,
  YjsBaseApi,
  YjsCompactionApi,
  YjsPluginOptions,
  YjsPresenceApi,
  YjsRemoteCursor,
  YjsRemoteCursorData,
} from './types';

const DETACHED_STATUS: YjsAdmissionStatus = Object.freeze({
  reason: 'load',
  state: 'waiting',
});
const EMPTY_CURSORS = Object.freeze([]) as readonly YjsRemoteCursor[];
const EMPTY_CURSOR_IDS = Object.freeze([]) as readonly number[];

export type YjsCursorCache<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = Readonly<{
  forView: (view: YjsEditor) => Readonly<{
    remoteCursor: (clientId: number) => YjsRemoteCursor<TCursorData> | null;
  }>;
  remoteCursor: (clientId: number) => YjsRemoteCursor<TCursorData> | null;
  remoteCursorIds: () => readonly number[];
  subscribeCursor: (clientId: number, listener: () => void) => () => void;
  subscribeIds: (listener: () => void) => () => void;
}>;

type Forward<TCursorData extends YjsRemoteCursorData> = {
  listener: () => void;
  subscribe: (
    controller: YjsController<TCursorData>,
    listener: () => void
  ) => () => void;
  unsubscribe: (() => void) | null;
};

export class YjsBinding<TCursorData extends YjsRemoteCursorData> {
  controller: YjsController<TCursorData> | null = null;
  published = false;
  records = 0;
  private readonly editor: YjsEditor;
  private readonly forwards = new Set<Forward<TCursorData>>();
  private readonly options: YjsPluginOptions<TCursorData>;
  private pendingCursorData: Readonly<{ data: TCursorData | null }> | null =
    null;
  private readonly viewCursors = new WeakMap<
    YjsEditor,
    ReturnType<YjsCursorCache<TCursorData>['forView']>
  >();
  private sharedBaseApi: YjsBaseApi | null = null;
  private sharedCursorCache: YjsCursorCache<TCursorData> | null = null;

  constructor(editor: YjsEditor, options: YjsPluginOptions<TCursorData>) {
    this.editor = editor;
    this.options = options;
  }

  attach(controller: YjsController<TCursorData>): void {
    this.controller = controller;
    setActiveYjsController(this.editor, controller);
    for (const forward of this.forwards) {
      forward.unsubscribe = forward.subscribe(controller, forward.listener);
    }
    this.notify();
  }

  publishPendingCursorData(): void {
    if (!this.controller || !this.pendingCursorData) return;

    const { data } = this.pendingCursorData;

    this.controller.presenceApi(this.editor).setCursorData(data);
    this.pendingCursorData = null;
  }

  detach(): void {
    const { controller } = this;

    if (!controller) return;

    this.controller = null;
    deleteActiveYjsController(this.editor, controller);
    for (const forward of this.forwards) forward.unsubscribe = null;
    try {
      controller.destroy();
    } finally {
      this.notify();
    }
  }

  destroy(): void {
    this.detach();
    this.forwards.clear();
    this.pendingCursorData = null;
  }

  baseApi(): YjsBaseApi {
    this.sharedBaseApi ??= Object.freeze({
      admissionStatus: () =>
        this.controller?.baseApi().admissionStatus() ?? DETACHED_STATUS,
      retryImport: () => {
        this.controller?.baseApi().retryImport();
      },
      subscribeAdmissionStatus: this.forward((controller, listener) =>
        controller.baseApi().subscribeAdmissionStatus(listener)
      ),
    });

    return this.sharedBaseApi;
  }

  presenceApi(view: YjsEditor): YjsPresenceApi<TCursorData> {
    return Object.freeze({
      clearSelection: () => {
        this.controller?.presenceApi(view).clearSelection();
      },
      remoteCursor: (clientId) =>
        this.controller?.presenceApi(view).remoteCursor(clientId) ?? null,
      remoteCursors: () =>
        this.controller?.presenceApi(view).remoteCursors() ??
        (EMPTY_CURSORS as ReadonlyArray<YjsRemoteCursor<TCursorData>>),
      setCursorData: (data) => {
        if (this.controller) {
          this.controller.presenceApi(view).setCursorData(data);
          return;
        }
        if (
          data !== null &&
          !(this.options.cursorData?.validate(data) ?? isRecord(data))
        ) {
          throw new Error(
            'Yjs cursor data does not match its configured schema.'
          );
        }
        this.pendingCursorData = Object.freeze({ data });
      },
      subscribeRemoteCursors: this.forward((controller, listener) =>
        controller.presenceApi(view).subscribeRemoteCursors(listener)
      ),
      syncSelection: () => {
        this.controller?.presenceApi(view).syncSelection();
      },
    });
  }

  compactionApi(): YjsCompactionApi {
    return Object.freeze({
      retireSharedEffectPeer: (clientId) => {
        if (!this.controller) {
          throw new Error('Yjs binding is not attached to its document.');
        }
        this.controller.compactionApi().retireSharedEffectPeer(clientId);
      },
    });
  }

  cursorCache(): YjsCursorCache<TCursorData> {
    this.sharedCursorCache ??= Object.freeze({
      forView: (view) => {
        const existing = this.viewCursors.get(view);

        if (existing) return existing;

        const cursors = Object.freeze({
          remoteCursor: (clientId: number) =>
            this.controller?.cursorCache(view).remoteCursor(clientId) ?? null,
        });

        this.viewCursors.set(view, cursors);

        return cursors;
      },
      remoteCursor: (clientId) =>
        this.controller?.cursorCache().remoteCursor(clientId) ?? null,
      remoteCursorIds: () =>
        this.controller?.cursorCache().remoteCursorIds() ?? EMPTY_CURSOR_IDS,
      subscribeCursor: (clientId, listener) =>
        this.forward((controller, forwarded) =>
          controller.cursorCache().subscribeCursor(clientId, forwarded)
        )(listener),
      subscribeIds: this.forward((controller, listener) =>
        controller.cursorCache().subscribeIds(listener)
      ),
    });

    return this.sharedCursorCache;
  }

  private forward(
    subscribe: Forward<TCursorData>['subscribe']
  ): (listener: () => void) => () => void {
    return (listener) => {
      const forward: Forward<TCursorData> = {
        listener,
        subscribe,
        unsubscribe: this.controller
          ? subscribe(this.controller, listener)
          : null,
      };

      this.forwards.add(forward);

      return () => {
        if (!this.forwards.delete(forward)) return;
        forward.unsubscribe?.();
        forward.unsubscribe = null;
      };
    };
  }

  private notify(): void {
    for (const { listener } of [...this.forwards]) listener();
  }
}

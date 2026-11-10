import * as React from 'react';

type Recorder = { mounts: number; stop: () => void };

const unreleasedPresses = new WeakMap<Event, { dragOrMenu: Event | null }>();
const latePresses = new WeakSet<Event>();
const strayClicks = new WeakSet<Event>();
const recorders = new WeakMap<Window, Recorder>();

export const isHeldPress = (press: Event) => {
  const state = unreleasedPresses.get(press);

  return !!state && (!state.dragOrMenu || state.dragOrMenu.defaultPrevented);
};

export const isLatePress = (event: Event) => latePresses.has(event);

export const isStrayClick = (event: Event) => strayClicks.has(event);

/**
 * Under an input method such as WeType, WebKit can deliver a trackpad tap's
 * mouseup before its mousedown, which it stamps no later than that mouseup and
 * follows with no click. The next release then brings a click with that
 * release's stamp on the nearest ancestor of both targets.
 * https://bugs.webkit.org/show_bug.cgi?id=219670
 */
const record = (view: Window): Recorder => {
  let held: Event | null = null;
  let last: { at: number; paired: boolean } | null = null;
  const release = () => {
    if (held) unreleasedPresses.delete(held);
    held = null;
  };
  const noteDragOrMenu = (event: Event) => {
    if (held && isHeldPress(held)) {
      unreleasedPresses.set(held, { dragOrMenu: event });
    }
  };
  const captured: Record<string, (event: MouseEvent) => void> = {
    click: (event) => {
      if (event.detail === 0) return;
      if (event.isTrusted) release();
      if (last && !last.paired && event.timeStamp === last.at) {
        strayClicks.add(event);
      }
    },
    contextmenu: noteDragOrMenu,
    dragstart: noteDragOrMenu,
    mousedown: (event) => {
      if (event.button !== 0) return;
      release();
      if (
        last &&
        (event.timeStamp < last.at ||
          (!last.paired && event.timeStamp === last.at))
      ) {
        last.paired = true;
        latePresses.add(event);
      } else {
        held = event;
        unreleasedPresses.set(event, { dragOrMenu: null });
      }
    },
    mouseup: (event) => {
      if (event.button !== 0) return;
      last = { at: event.timeStamp, paired: !!held && isHeldPress(held) };
      release();
    },
  };
  const entries = Object.entries(captured) as Array<[string, EventListener]>;

  for (const [type, listener] of entries) {
    view.addEventListener(type, listener, { capture: true, passive: true });
  }
  view.addEventListener('blur', release);

  return {
    mounts: 0,
    stop: () => {
      release();
      for (const [type, listener] of entries) {
        view.removeEventListener(type, listener, { capture: true });
      }
      view.removeEventListener('blur', release);
    },
  };
};

export function TapOrderEffect({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  React.useLayoutEffect(() => {
    const view = editableRef.current?.ownerDocument.defaultView;

    if (!view) return undefined;

    const recorder = recorders.get(view) ?? record(view);
    recorders.set(view, recorder);
    recorder.mounts += 1;

    return () => {
      recorder.mounts -= 1;
      queueMicrotask(() => {
        if (recorder.mounts > 0 || recorders.get(view) !== recorder) return;
        recorders.delete(view);
        recorder.stop();
      });
    };
  }, [editableRef]);

  return null;
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import RichTextExample from '../../../../www/src/app/(app)/examples/plite/_examples/richtext';

type BrowserHandle = Readonly<{
  getDOMSelection: () => unknown;
  getHistory: () => unknown;
  getInputState: () => unknown;
  getKernelTrace: () => readonly unknown[];
  getLastCommit: () => unknown;
  getSelection: () => unknown;
  getText: () => string;
  getValue: () => unknown;
}>;

type LabEvent = Readonly<{
  data: string | null;
  defaultPrevented: boolean;
  family: string;
  inputType: string | null;
  isComposing: boolean;
  key: string | null;
  modifiers: readonly string[];
  targetPath: string | null;
  targetRanges: readonly Readonly<{
    endOffset: number;
    startOffset: number;
  }>[];
  time: number;
}>;

type LabSnapshot = Readonly<{
  dom: Readonly<{
    html: string;
    selection: unknown;
    text: string;
  }>;
  input: unknown;
  kernelTrace: readonly unknown[];
  label: string;
  model: Readonly<{
    history: unknown;
    lastCommit: unknown;
    selection: unknown;
    text: string;
    value: unknown;
  }>;
  time: number;
}>;

type LabExport = Readonly<{
  capturedAt: string;
  device: ReturnType<typeof readDeviceMetadata>;
  events: readonly LabEvent[];
  notice: string;
  replay: readonly Readonly<{
    data: string | null;
    family: string;
    inputType: string | null;
    isComposing: boolean;
    key: string | null;
    modifiers: readonly string[];
    targetPath: string | null;
  }>[];
  snapshots: readonly LabSnapshot[];
  version: 1;
}>;

const EVENT_FAMILIES = [
  'beforeinput',
  'compositionend',
  'compositionstart',
  'compositionupdate',
  'input',
  'keydown',
  'keyup',
  'paste',
] as const;
const TRACE_LIMIT = 500;

const readDeviceMetadata = () => {
  if (typeof window === 'undefined') return null;
  const navigatorRecord = navigator as Navigator & {
    standalone?: boolean;
    userAgentData?: {
      brands?: readonly Readonly<{ brand: string; version: string }>[];
      mobile?: boolean;
      platform?: string;
    };
  };

  return {
    capturedAt: new Date().toISOString(),
    devicePixelRatio: window.devicePixelRatio,
    language: navigator.language,
    languages: [...navigator.languages],
    maxTouchPoints: navigator.maxTouchPoints,
    platform: navigatorRecord.userAgentData?.platform ?? navigator.platform,
    screen: {
      height: window.screen.height,
      width: window.screen.width,
    },
    standalone: navigatorRecord.standalone ?? false,
    touchEvent: 'ontouchstart' in window,
    userAgent: navigator.userAgent,
    userAgentData: navigatorRecord.userAgentData ?? null,
    viewport: {
      height: window.innerHeight,
      visualHeight: window.visualViewport?.height ?? null,
      visualOffsetTop: window.visualViewport?.offsetTop ?? null,
      width: window.innerWidth,
    },
  };
};

const readHandle = (root: HTMLElement): BrowserHandle | null =>
  (root as HTMLElement & { __pliteBrowserHandle?: BrowserHandle })
    .__pliteBrowserHandle ?? null;

const readTargetPath = (target: EventTarget | null) =>
  target instanceof Element
    ? (target.closest('[data-plite-path]')?.getAttribute('data-plite-path') ??
      null)
    : null;

const summarizeTargetRanges = (event: Event) => {
  if (!(event instanceof InputEvent) || !event.getTargetRanges) return [];

  return [...event.getTargetRanges()].map((range) => ({
    endOffset: range.endOffset,
    startOffset: range.startOffset,
  }));
};

const summarizeEvent = (event: Event): LabEvent => {
  const inputEvent = event instanceof InputEvent ? event : null;
  const keyboardEvent = event instanceof KeyboardEvent ? event : null;
  const compositionEvent = event instanceof CompositionEvent ? event : null;
  const modifiers = keyboardEvent
    ? [
        ...(keyboardEvent.altKey ? ['alt'] : []),
        ...(keyboardEvent.ctrlKey ? ['control'] : []),
        ...(keyboardEvent.metaKey ? ['meta'] : []),
        ...(keyboardEvent.shiftKey ? ['shift'] : []),
      ]
    : [];

  return Object.freeze({
    data: inputEvent?.data ?? compositionEvent?.data ?? null,
    defaultPrevented: event.defaultPrevented,
    family: event.type,
    inputType: inputEvent?.inputType ?? null,
    isComposing: inputEvent?.isComposing ?? keyboardEvent?.isComposing ?? false,
    key: keyboardEvent?.key ?? null,
    modifiers,
    targetPath: readTargetPath(event.target),
    targetRanges: summarizeTargetRanges(event),
    time: performance.now(),
  });
};

const createSnapshot = (
  root: HTMLElement,
  label: string
): LabSnapshot | null => {
  const handle = readHandle(root);

  if (!handle) return null;

  return Object.freeze({
    dom: Object.freeze({
      html: root.innerHTML,
      selection: handle.getDOMSelection(),
      text: root.textContent ?? '',
    }),
    input: handle.getInputState(),
    kernelTrace: handle.getKernelTrace().slice(-80),
    label,
    model: Object.freeze({
      history: handle.getHistory(),
      lastCommit: handle.getLastCommit(),
      selection: handle.getSelection(),
      text: handle.getText(),
      value: handle.getValue(),
    }),
    time: performance.now(),
  });
};

export function MobileLabClient() {
  const [capturedAt, setCapturedAt] = useState('');
  const [capturing, setCapturing] = useState(true);
  const [device, setDevice] =
    useState<ReturnType<typeof readDeviceMetadata>>(null);
  const [events, setEvents] = useState<readonly LabEvent[]>([]);
  const [snapshots, setSnapshots] = useState<readonly LabSnapshot[]>([]);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const snapshotsRef = useRef<readonly LabSnapshot[]>([]);

  useEffect(() => {
    setCapturedAt(new Date().toISOString());
    setDevice(readDeviceMetadata());

    const findRoot = () => {
      const next = document.querySelector<HTMLElement>(
        '[data-plite-editor="true"]'
      );

      if (next) setRoot(next);
    };

    findRoot();
    const observer = new MutationObserver(findRoot);

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const storeSnapshot = useCallback((snapshot: LabSnapshot) => {
    const next = [...snapshotsRef.current, snapshot].slice(-TRACE_LIMIT);

    snapshotsRef.current = next;
    setSnapshots(next);

    return next;
  }, []);
  const captureSnapshot = useCallback(
    (label: string) => {
      if (!root) return;
      const snapshot = createSnapshot(root, label);

      if (!snapshot) return;
      storeSnapshot(snapshot);
    },
    [root, storeSnapshot]
  );

  useEffect(() => {
    if (!capturing || !root) return;

    const onEvent = (event: Event) => {
      const entry = summarizeEvent(event);

      setEvents((current) => [...current, entry].slice(-TRACE_LIMIT));
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        captureSnapshot(event.type);
        frameRef.current = null;
      });
    };

    EVENT_FAMILIES.forEach((family) => {
      root.addEventListener(family, onEvent);
    });
    captureSnapshot('capture-start');

    return () => {
      EVENT_FAMILIES.forEach((family) => {
        root.removeEventListener(family, onEvent);
      });
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [captureSnapshot, capturing, root]);

  const payload = useMemo<LabExport>(
    () => ({
      capturedAt,
      device,
      events,
      notice:
        'This lab records browser events and semantic state. It is not a raw-device proof receipt.',
      replay: events.map(
        ({
          data,
          family,
          inputType,
          isComposing,
          key,
          modifiers,
          targetPath,
        }) => ({
          data,
          family,
          inputType,
          isComposing,
          key,
          modifiers,
          targetPath,
        })
      ),
      snapshots,
      version: 1,
    }),
    [capturedAt, device, events, snapshots]
  );
  const exportJson = useCallback(() => {
    const snapshot = root ? createSnapshot(root, 'export') : null;
    const exportSnapshots = snapshot
      ? storeSnapshot(snapshot)
      : snapshotsRef.current;
    const blob = new Blob(
      [JSON.stringify({ ...payload, snapshots: exportSnapshots }, null, 2)],
      {
        type: 'application/json',
      }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.download = `plite-mobile-lab-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [payload, root, storeSnapshot]);

  return (
    <main
      className="mx-auto flex max-w-5xl min-w-0 flex-col gap-6 px-4 py-6"
      data-plite-mobile-lab
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Mobile input lab</h1>
        <p>
          Open this LAN route on a phone to record browser input, model, DOM,
          selection, device, and replay data. A capture is evidence, not an
          automatic raw-device proof verdict.
        </p>
      </header>
      <section className="flex flex-wrap gap-3" aria-label="Capture controls">
        <button
          className="rounded border px-3 py-2"
          data-test-id="mobile-lab-capture"
          onClick={() => setCapturing((value) => !value)}
          type="button"
        >
          {capturing ? 'Pause capture' : 'Resume capture'}
        </button>
        <button
          className="rounded border px-3 py-2"
          data-test-id="mobile-lab-snapshot"
          onClick={() => captureSnapshot('manual')}
          type="button"
        >
          Snapshot
        </button>
        <button
          className="rounded border px-3 py-2"
          data-test-id="mobile-lab-export"
          onClick={exportJson}
          type="button"
        >
          Export replay JSON
        </button>
        <button
          className="rounded border px-3 py-2"
          data-test-id="mobile-lab-clear"
          onClick={() => {
            if (frameRef.current !== null) {
              cancelAnimationFrame(frameRef.current);
              frameRef.current = null;
            }
            setEvents([]);
            snapshotsRef.current = [];
            setSnapshots([]);
          }}
          type="button"
        >
          Clear
        </button>
        <output className="self-center" data-test-id="mobile-lab-counts">
          {events.length} events · {snapshots.length} snapshots
        </output>
      </section>
      <RichTextExample />
      <details>
        <summary>Latest state</summary>
        <pre
          className="max-h-96 overflow-auto rounded border p-3 text-xs"
          data-test-id="mobile-lab-latest-state"
        >
          {JSON.stringify(snapshots.at(-1) ?? null, null, 2)}
        </pre>
      </details>
      <details>
        <summary>Device metadata</summary>
        <pre
          className="max-h-96 overflow-auto rounded border p-3 text-xs"
          data-test-id="mobile-lab-device"
        >
          {JSON.stringify(payload.device, null, 2)}
        </pre>
      </details>
      <details>
        <summary>Replay JSON</summary>
        <textarea
          className="h-72 w-full rounded border p-3 font-mono text-xs"
          data-test-id="mobile-lab-replay-json"
          readOnly
          value={JSON.stringify(payload, null, 2)}
        />
      </details>
    </main>
  );
}

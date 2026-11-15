'use client';

import { createEditorView } from 'platejs';
import { readCoreWork } from 'plitejs/internal';

import {
  type BoardArrowEnds,
  type BoardArrowTarget,
  boardArrowTargetOf,
  resolveBoardArrow,
} from '../../../../packages/platejs/src/features/board/lib/boardArrow.internal';
import { createProductionRenderer } from './board-production';
import {
  createBoardRenderer,
  type ShapeBox,
  shapeBox,
  transformOf,
} from './board-renderer';
import {
  BROWSER_COHORTS,
  BUSY_PLANT_MS,
  DEFER_PLANT_MS,
  K2_BUSY_MS,
  LAYOUT_THRASH_SHAPES,
  NEXT_RENDER_ARM,
  type BoardView,
  parseBoardQuery,
} from './browser-cohorts';
import {
  type AuthoredChanges,
  type BoardCamera,
  type BoardFault,
  type BoardFixture,
  type BoardPoint,
  buildBoardFixture,
  buildFlatFixture,
  expectedReadback,
  pendingShapesOf,
  readBoardWorkload,
  toStubLayout,
  type SeededCrossing,
  shiftBoardFixture,
  toShippedStorage,
  type StoredNode,
  type StoredValue,
  VIEWPORT,
} from './stub-board';

type ProbeTx = {
  nodes: { set: (props: object, options: { at: number[] }) => void };
  text: {
    insert: (
      text: string,
      options?: { at: { offset: number; path: number[] } }
    ) => void;
  };
};

type ProbeEditor = Readonly<{
  read: {
    authored: { changes: AuthoredChanges };
    selection: () => {
      anchor: { offset: number; path: readonly number[]; root?: string };
      focus: { offset: number; path: readonly number[]; root?: string };
    } | null;
    value: () => unknown;
  };
  update: (run: (tx: ProbeTx) => void) => void;
}>;

const cameraFor = (
  view: BoardView,
  fixture: BoardFixture,
  offset: BoardPoint = { x: 0, y: 0 }
): BoardCamera => {
  if (view === 'dense') return fixture.camera;
  if (view === 'origin') return { x: -offset.x, y: -offset.y, zoom: 1 };

  const [index] = fixture.typed.textPath;
  const shape = (
    fixture.value.roots?.[fixture.typed.root] as
      | readonly StoredNode[]
      | undefined
  )?.[index];

  if (!shape) throw new Error(`no shape at ${fixture.typed.root} [${index}]`);
  const box = shapeBox(shape);

  return {
    x: box.x + box.width / 2 - VIEWPORT.width / 2,
    y: box.y + box.height / 2 - VIEWPORT.height / 2,
    zoom: 1,
  };
};

const STUB_FAULTS = new Set<string>(['N', 'A', 'S', 'F', 'position']);

const shapesById = (shapes: readonly StoredNode[]) =>
  new Map(shapes.map((shape) => [shape.shapeId ?? '', shape]));

const targetsOf =
  (
    shapes: ReadonlyMap<string, StoredNode>,
    carried: ReadonlySet<string> = new Set(),
    delta: BoardPoint = { x: 0, y: 0 }
  ) =>
  (id: string): BoardArrowTarget | undefined => {
    const shape = shapes.get(id);

    if (!shape?.place || !shape.size) return undefined;
    const shift = carried.has(id) ? delta : { x: 0, y: 0 };

    return boardArrowTargetOf({
      place: { x: shape.place.x + shift.x, y: shape.place.y + shift.y },
      size: shape.size,
    });
  };

const drawnEnds = (
  shape: StoredNode,
  targetOf: (id: string) => BoardArrowTarget | undefined
) =>
  shape.start && shape.end
    ? resolveBoardArrow({ end: shape.end, start: shape.start }, targetOf)
    : null;

const spanOf = ({ end, start }: BoardArrowEnds): ShapeBox => ({
  height: Math.abs(end.y - start.y),
  width: Math.abs(end.x - start.x),
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
});

const drawnBox = (
  shape: StoredNode,
  targetOf: (id: string) => BoardArrowTarget | undefined
) => {
  const ends = drawnEnds(shape, targetOf);

  return ends ? spanOf(ends) : shapeBox(shape);
};

const FRAME_MS = 17;

const keydownSpreadMs = (key: number) => (key * 7) % FRAME_MS;

const QUARTER_FRAME_SLACK = 0.25;

export const prepareBoardScale = (search: string) => {
  const query = parseBoardQuery(search);
  const claim = BROWSER_COHORTS[query.cohort];
  const fault =
    query.knownBad && STUB_FAULTS.has(query.knownBad)
      ? (query.knownBad as BoardFault)
      : undefined;
  const claimed = buildBoardFixture(claim.workload);
  const claimedCamera = cameraFor(claim.view, claimed);
  const claimedRead = readBoardWorkload(
    claimed.value,
    claimed.typed.shapeId,
    [],
    claimedCamera,
    false
  );
  const faulted = fault ? buildBoardFixture(claim.workload, fault) : claimed;
  const view =
    query.knownBad === 'view' && claim.view === 'dense' ? 'typed' : claim.view;
  const stub = query.renderer === 'stub';
  const wanted = cameraFor(view, faulted);
  const offset = stub ? { x: 0, y: 0 } : { x: wanted.x, y: wanted.y };
  const shifted = stub ? faulted : shiftBoardFixture(faulted, offset);
  const camera = cameraFor(view, shifted, offset);
  const built = stub ? shifted : toShippedStorage(shifted);
  const mountedArm =
    query.knownBad === 'arm' ? NEXT_RENDER_ARM[query.arm] : query.arm;
  const flat =
    query.build === 'flat' ? buildFlatFixture(claimedRead.blockCount) : null;
  const rendererConfig = { arm: mountedArm, camera, plant: query.plant };
  const renderer = stub
    ? createBoardRenderer(rendererConfig)
    : createProductionRenderer(rendererConfig);

  return {
    camera,
    claim,
    expected: flat
      ? { blocks: claimedRead.blockCount, collaboration: false }
      : {
          ...expectedReadback(claim.workload),
          arm: query.arm,
          shapesInView: claimedRead.shapesInView,
        },
    fixture: built,
    mountedArm,
    offset,
    plugins: renderer.plugins,
    query,
    renderer,
    textPath: flat ? flat.textPath : built.typed.textPath,
    typedShapeId: flat ? null : built.typed.shapeId,
    value: flat ? flat.value : built.value,
  };
};

export type PreparedBoardScale = ReturnType<typeof prepareBoardScale>;

const percentile = (values: readonly number[], ratio: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)
  ];
};

const nextFrame = () =>
  new Promise<number>((resolve) => {
    requestAnimationFrame(resolve);
  });

const measureFrameInterval = async () => {
  const stamps: number[] = [];

  for (let frame = 0; frame < 61; frame++) stamps.push(await nextFrame());

  return percentile(
    stamps.slice(1).map((stamp, index) => stamp - stamps[index]),
    0.5
  );
};

type DragMove = {
  arrowsBehind: number;
  atPointer: boolean;
  frames: number;
  membersMissing: number;
  membersOff: number;
  ms: number;
};

type ScreenRect = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

type KeySample = {
  extraMs: number;
  frameEnd?: number;
  keydown: number;
  mutated?: number;
  stamp: number;
  trusted: boolean;
};

type K2Done =
  | Readonly<{ from: string | null; kind: 'selectionMoved' }>
  | Readonly<{ kind: 'aimMoved' }>
  | Readonly<{ kind: 'shapeAdded' }>;

type K2Arm = Readonly<{
  done: K2Done;
  event: 'keydown' | 'pointerdown' | 'pointerup';
  key: string | null;
  planted: boolean;
  said: Readonly<{ end: string; start: string }> | null;
}>;

type K2Sample = {
  done?: number;
  extraMs: number;
  mounts?: number;
  result?: string;
  resultAt?: number;
  start: number;
  trusted: boolean;
  rerenderedIds?: string[];
  rerenders?: number;
  words?: string;
  wordsAt?: number;
};

const LIVE_REGION = '[role="status"][aria-live="polite"]';

const liveRegionOf = ({ target }: MutationRecord) =>
  (target instanceof Element ? target : target.parentElement)?.closest(
    LIVE_REGION
  ) ?? null;

const fullyIn = (box: ShapeBox, view: ScreenRect) =>
  box.x >= view.left &&
  box.x + box.width <= view.right &&
  box.y >= view.top &&
  box.y + box.height <= view.bottom;

const ABOVE_ARROWS_PX = 10;

const lineEndKey = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

export const installBoardProbe = (
  editor: ProbeEditor,
  prepared: PreparedBoardScale
) => {
  const { query, renderer, textPath } = prepared;
  const { plant } = query;
  const { busyWait, bumpShapeTick, plantWork } = renderer;
  const boardStats = renderer.stats;
  const typedRoot = prepared.typedShapeId ? prepared.fixture.typed.root : null;
  const typedView = () => (typedRoot ? renderer.viewOf(typedRoot) : null);
  const readCamera = () => typedView()?.camera ?? prepared.camera;
  const boardLayer = () => typedView()?.layer ?? null;
  const readBoardTransform = () => transformOf(typedView());
  const rootUpdate = (run: (tx: ProbeTx) => void) =>
    (
      createEditorView(editor as never, {
        root: typedRoot ?? '',
      }) as unknown as {
        update: (run: (tx: ProbeTx) => void) => void;
      }
    ).update(run);
  const storedValue = () =>
    toStubLayout(
      JSON.parse(JSON.stringify(editor.read.value())) as StoredValue
    );
  const textAtPath = `[data-editor-node="text"][data-editor-path="${textPath.join(',')}"]`;
  const typedTextSelector = typedRoot
    ? `[data-board="${typedRoot}"] ${textAtPath}`
    : `${textAtPath}:not([data-board] *)`;
  const textHost = () => document.querySelector<HTMLElement>(typedTextSelector);
  const editable = () =>
    textHost()?.closest<HTMLElement>('[contenteditable="true"]') ??
    document.querySelector<HTMLElement>('[contenteditable="true"]');
  const typedText = () =>
    textHost()?.textContent?.replaceAll('\uFEFF', '') ?? null;
  const shapeElements = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-shape-id]'));
  const channel = new MessageChannel();
  const samples: KeySample[] = [];
  let typing: { before: string; current: KeySample | null } | null = null;
  let onFrameEnd: (() => void) | null = null;
  let drag: {
    count: () => number;
    finish: () => {
      boundArrowsInView: number;
      boundArrowsRedrawn: number;
      members: number;
      membersInView: number;
      moves: DragMove[];
      nonMemberRenders: number;
      nonMembersChecked: number;
      nonMembersMoved: string[];
      releaseWrites: number;
      writes: number;
    };
  } | null = null;

  const boardIndex = prepared.fixture.value.children.findIndex(
    (block) => (block as StoredNode).childRoots?.shapes === typedRoot
  );

  renderer.setCameraWrite(() => {
    editor.update((tx) =>
      tx.nodes.set(
        { height: VIEWPORT.height + (plantWork.cameraWrites % 2) },
        { at: [boardIndex] }
      )
    );
  });

  window.addEventListener(
    'keydown',
    (event) => {
      if (!typing || event.key.length !== 1) return;
      typing.current = {
        extraMs: 0,
        keydown: performance.now(),
        stamp: event.timeStamp,
        trusted: event.isTrusted,
      };
      samples.push(typing.current);
    },
    true
  );

  const ownN1 = () =>
    samples
      .filter((sample) => sample.mutated !== undefined)
      .map((sample) => (sample.mutated ?? 0) - sample.keydown - sample.extraMs);
  const ownN2 = () =>
    samples
      .filter((sample) => sample.frameEnd !== undefined)
      .map((sample) => (sample.frameEnd ?? 0) - sample.stamp - sample.extraMs);

  if (
    plant === 'busy' ||
    plant === 'render' ||
    plant === 'shape-render' ||
    plant === 'layout'
  ) {
    window.addEventListener(
      'keydown',
      (event) => {
        const current = typing?.current;

        if (!current || event.key.length !== 1) return;
        if (plant === 'busy') {
          busyWait(BUSY_PLANT_MS);
          current.extraMs += BUSY_PLANT_MS;
        } else if (plant === 'render' || plant === 'shape-render') {
          bumpShapeTick();
        } else {
          const shapes = shapeElements().slice(0, LAYOUT_THRASH_SHAPES);

          for (const shape of shapes) {
            shape.style.marginTop = shape.style.marginTop ? '' : '0.5px';
            void shape.offsetTop;
          }
          plantWork.layoutReads += shapes.length;
        }
      },
      true
    );
  }
  if (plant === 'slow' && query.slowBasis === 'n1') {
    window.addEventListener(
      'keydown',
      (event) => {
        const current = typing?.current;
        const own = ownN1();

        if (!current || event.key.length !== 1 || own.length === 0) return;
        const extra = (query.factor - 1) * percentile(own, 0.5);
        busyWait(extra);
        current.extraMs += extra;
      },
      true
    );
  }
  if (plant === 'defer') {
    window.addEventListener(
      'beforeinput',
      (event) => {
        const { data } = event;

        if (!typing || event.inputType !== 'insertText' || !data) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        plantWork.deferredKeys += 1;
        setTimeout(
          () => editor.update((tx) => tx.text.insert(data)),
          DEFER_PLANT_MS
        );
      },
      true
    );
  }

  channel.port1.addEventListener('message', () => {
    const current = typing?.current;

    if (current && current.frameEnd === undefined) {
      current.frameEnd = performance.now();
      onFrameEnd?.();
    }
  });
  channel.port1.start();

  const observer = new MutationObserver(() => {
    const current = typing?.current;

    if (!typing || !current || current.mutated !== undefined) return;
    const count = samples.indexOf(current) + 1;

    if (typedText() !== 'x'.repeat(count) + typing.before) return;
    current.mutated = performance.now();
    requestAnimationFrame(() => {
      if (plant === 'slow' && query.slowBasis === 'n2') {
        const own = ownN2();

        if (own.length > 0) {
          const extra = (query.factor - 1) * percentile(own, 0.5);
          busyWait(extra);
          current.extraMs += extra;
        }
      }
      channel.port2.postMessage(null);
    });
  });

  const boardHost = () =>
    document.querySelector<HTMLElement>(`[data-board="${typedRoot}"]`);
  const aimLineEnd = () => {
    const line = boardHost()?.querySelector(
      'svg[data-board-arrow-preview] line'
    );

    return line
      ? lineEndKey(
          Number(line.getAttribute('x2')),
          Number(line.getAttribute('y2'))
        )
      : null;
  };
  const rootShapes = () =>
    (editor.read.value() as StoredValue).roots?.[typedRoot ?? ''] ?? [];
  const selectedShapes = () =>
    Array.from(
      boardHost()?.querySelectorAll('[data-board-shape][data-selected]') ?? [],
      (element) => element.getAttribute('data-board-shape') ?? ''
    );
  let k2: {
    arm: K2Arm;
    before: {
      mounts: number;
      renders: ReadonlyMap<string, number>;
    } | null;
    known: ReadonlySet<string>;
    lineBefore: string | null;
    notify: (() => void) | null;
    sample: K2Sample | null;
    settled: boolean;
  } | null = null;
  let shapeAtLineEnd = new Map<string, string>();
  const indexLineEnds = (shapes: readonly StoredNode[]) =>
    new Map(
      shapes.flatMap((shape) => {
        const box = shapeBox(shape);

        return shape.type === 'boardArrow'
          ? []
          : [
              [
                lineEndKey(box.x + box.width / 2, box.y + box.height / 2),
                shape.shapeId ?? '',
              ] as const,
            ];
      })
    );
  const aimedShapeAt = (end: string) =>
    shapeAtLineEnd.get(end) ?? `line at ${end}`;

  const k2ResultOf = (arm: K2Arm, result: string | undefined) =>
    arm.done.kind === 'aimMoved' && result ? aimedShapeAt(result) : result;
  const k2Channel = new MessageChannel();

  const addedShape = (records: readonly MutationRecord[]) => {
    if (!k2) return null;
    for (const record of records) {
      const elements =
        record.type === 'attributes'
          ? [record.target]
          : Array.from(record.addedNodes).flatMap((node) =>
              node instanceof Element
                ? [node, ...node.querySelectorAll('[data-board-shape]')]
                : []
            );

      for (const element of elements) {
        const id =
          element instanceof Element
            ? element.getAttribute('data-board-shape')
            : null;

        if (id && !k2.known.has(id)) return id;
      }
    }

    return null;
  };

  const k2Result = (records: readonly MutationRecord[]) => {
    if (!k2) return null;
    const { done } = k2.arm;

    if (done.kind === 'shapeAdded') return addedShape(records);
    if (done.kind === 'selectionMoved') {
      const ids = selectedShapes();

      return ids.length === 1 && ids[0] !== done.from ? ids[0] : null;
    }
    const end = aimLineEnd();

    return end !== null && end !== k2.lineBefore ? end : null;
  };

  const k2Observer = new MutationObserver((records) => {
    const now = performance.now();
    const sample = k2?.sample;

    if (!k2 || !sample || sample.done !== undefined) return;
    const { said } = k2.arm;

    if (said && sample.wordsAt === undefined) {
      const words = records
        .map((record) => liveRegionOf(record)?.textContent ?? '')
        .find((text) => text.startsWith(said.start) && text.endsWith(said.end));

      if (words) {
        sample.wordsAt = now;
        sample.words = words;
      }
    }
    if (sample.resultAt === undefined) {
      const result = k2Result(records);

      if (result !== null) {
        sample.resultAt = now;
        sample.result = result;
      }
    }
    if (sample.resultAt === undefined) return;
    if (said && sample.wordsAt === undefined) return;
    sample.done = Math.max(sample.resultAt, sample.wordsAt ?? sample.resultAt);
    // A second commit after the insert's own, so React cannot fold it in.
    if (k2.arm.planted && plant === 'write-render') {
      setTimeout(bumpShapeTick, 0);
    }
    requestAnimationFrame(() => k2Channel.port2.postMessage(null));
  });

  k2Channel.port1.addEventListener('message', () => {
    // Queued after the write-render plant's timer, so its commit is counted.
    setTimeout(() => {
      const armed = k2;
      const sample = armed?.sample;

      if (!armed?.before || !sample || armed.settled) return;
      const { mounts, renders } = armed.before;
      const counts = [...renders].map(
        ([id, count]) =>
          [id, (boardStats.renderedIds.get(id) ?? 0) - count] as const
      );

      sample.rerenders = counts.reduce((sum, [, count]) => sum + count, 0);
      sample.mounts = boardStats.mounts - mounts;
      sample.rerenderedIds = counts.flatMap(([id, count]) =>
        count > 0 ? [id] : []
      );
      k2Observer.disconnect();
      armed.settled = true;
      armed.notify?.();
    }, 0);
  });
  k2Channel.port1.start();

  const startK2 = (event: Event) => {
    const armed = k2;

    if (!armed || armed.sample || event.type !== armed.arm.event) return;
    if (event instanceof KeyboardEvent && event.key !== armed.arm.key) return;
    armed.before = {
      mounts: boardStats.mounts,
      renders: new Map(
        shapeElements().map(({ dataset }) => {
          const id = dataset.shapeId ?? '';

          return [id, boardStats.renderedIds.get(id) ?? 0];
        })
      ),
    };
    const sample: K2Sample = {
      extraMs: 0,
      start: performance.now(),
      trusted: event.isTrusted,
    };

    armed.sample = sample;
    if (!armed.arm.planted) return;
    if (plant === 'busy') {
      const ms = K2_BUSY_MS[armed.arm.done.kind];

      busyWait(ms);
      sample.extraMs += ms;
    } else if (plant === 'aim-render') {
      bumpShapeTick();
    }
  };

  // The page installs the probe before the board mounts, so these window
  // capture listeners run before the board's own.
  window.addEventListener('keydown', startK2, true);
  window.addEventListener('pointerdown', startK2, true);
  window.addEventListener('pointerup', startK2, true);

  const readback = () => {
    const stored = storedValue();

    if (!prepared.typedShapeId) {
      return { blocks: stored.children.length, collaboration: false };
    }

    const surface = document.querySelector<HTMLElement>(
      `[data-board="${typedRoot}"]`
    );
    const size = surface?.getBoundingClientRect();

    if (
      size &&
      (size.width !== VIEWPORT.width || size.height !== VIEWPORT.height)
    ) {
      throw new Error(
        `the board surface is ${size.width}x${size.height}, not ${VIEWPORT.width}x${VIEWPORT.height}`
      );
    }
    if (
      query.renderer === 'production' &&
      (boardStats.geometryScans === 0 ||
        boardStats.indexBuilds === 0 ||
        boardStats.visibilityRecomputes === 0 ||
        boardStats.renders === 0)
    ) {
      throw new Error(
        `the shipped view counted no work: ${JSON.stringify({ geometryScans: boardStats.geometryScans, indexBuilds: boardStats.indexBuilds, renders: boardStats.renders, visibilityRecomputes: boardStats.visibilityRecomputes })}`
      );
    }
    const mountedArm = surface?.dataset.renderArm;

    return {
      ...readBoardWorkload(
        stored,
        prepared.typedShapeId,
        pendingShapesOf(stored, editor.read.authored.changes),
        readCamera(),
        false
      ),
      arm: mountedArm ?? null,
    };
  };

  const surfaceRect = () =>
    boardLayer()?.parentElement?.getBoundingClientRect() ?? null;

  const storedBoard = () => storedValue().roots?.[typedRoot ?? ''] ?? null;

  const viewRect = (camera: BoardCamera) => ({
    bottom: camera.y + VIEWPORT.height / camera.zoom,
    left: camera.x,
    right: camera.x + VIEWPORT.width / camera.zoom,
    top: camera.y,
  });

  const shapesInView = () => {
    const view = viewRect(readCamera());
    const shapes = storedBoard() ?? [];
    const targetOf = targetsOf(shapesById(shapes));

    return shapes.flatMap((shape) => {
      const box = drawnBox(shape, targetOf);

      return box.x <= view.right &&
        box.x + box.width >= view.left &&
        box.y <= view.bottom &&
        box.y + box.height >= view.top
        ? [shape.shapeId ?? '']
        : [];
    });
  };

  const isMounted = (shapeId: string) =>
    document.querySelector(`[data-shape-id="${shapeId}"]`) !== null;

  const screenRect = (
    box: ShapeBox,
    surface: DOMRect,
    camera = readCamera()
  ): ScreenRect => {
    const left = surface.left + (box.x - camera.x) * camera.zoom;
    const top = surface.top + (box.y - camera.y) * camera.zoom;

    return {
      bottom: top + box.height * camera.zoom,
      left,
      right: left + box.width * camera.zoom,
      top,
    };
  };

  const rectOff = (rect: ScreenRect, want: ScreenRect, slack: number) =>
    (['left', 'top', 'right', 'bottom'] as const).some(
      (edge) => Math.abs(rect[edge] - want[edge]) > slack
    );

  const placeError = (
    element: HTMLElement,
    shape: StoredNode,
    targetOf: (id: string) => BoardArrowTarget | undefined,
    surface: DOMRect
  ) => {
    const rect = element.getBoundingClientRect();
    const want = screenRect(drawnBox(shape, targetOf), surface);
    const arrow = Boolean(shape.start && shape.end);
    const at = (box: ScreenRect) =>
      `${box.left.toFixed(1)},${box.top.toFixed(1)}${arrow ? ` to ${box.right.toFixed(1)},${box.bottom.toFixed(1)}` : ''}`;
    const off = arrow
      ? rectOff(rect, want, 0.75)
      : Math.abs(rect.left - want.left) > 0.75 ||
        Math.abs(rect.top - want.top) > 0.75;

    return off
      ? `${element.dataset.shapeId} at ${at(rect)} not ${at(want)}`
      : null;
  };

  const crossingArrows = async () => {
    await nextFrame();
    await nextFrame();
    const view = viewRect(readCamera());
    const surface = surfaceRect();
    const shapes = storedBoard() ?? [];
    const targetOf = targetsOf(shapesById(shapes));
    const sees = (point: { x: number; y: number }) =>
      point.x >= view.left &&
      point.x <= view.right &&
      point.y >= view.top &&
      point.y <= view.bottom;

    return shapes.flatMap((shape) => {
      const ends = drawnEnds(shape, targetOf);

      if (!ends || sees(ends.start) || sees(ends.end)) return [];
      const box = spanOf(ends);

      if (
        box.x > view.right ||
        box.x + box.width < view.left ||
        box.y > view.bottom ||
        box.y + box.height < view.top
      ) {
        return [];
      }
      const id = shape.shapeId ?? '';
      const element = document.querySelector<HTMLElement>(
        `[data-shape-id="${id}"]`
      );

      return [
        {
          id,
          misplaced:
            element && surface
              ? placeError(element, shape, targetOf, surface)
              : null,
          mounted: element !== null,
        },
      ];
    });
  };

  const misplaced = async () => {
    await nextFrame();
    await nextFrame();
    const surface = surfaceRect();
    const shapes = storedBoard();
    const wrong: string[] = [];

    if (!surface || !shapes) return ['no board surface'];
    const targetOf = targetsOf(shapesById(shapes));
    const byId = new Map(
      shapes.map((shape, index) => [shape.shapeId ?? '', { index, shape }])
    );
    let lastIndex = -1;

    for (const element of shapeElements()) {
      const found = byId.get(element.dataset.shapeId ?? '');

      if (!found) continue;
      const { index, shape } = found;

      if (index <= lastIndex) {
        wrong.push(
          `${element.dataset.shapeId} mounted ${index === lastIndex ? 'twice' : 'out of stored order'}`
        );
      }
      lastIndex = index;
      const error = placeError(element, shape, targetOf, surface);

      if (error) wrong.push(error);
    }
    for (const shapeId of shapesInView()) {
      if (!isMounted(shapeId)) wrong.push(`${shapeId} in view but unmounted`);
    }

    return wrong;
  };

  const wheelPan = (dx: number, dy = 0) =>
    boardLayer()?.parentElement?.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaX: dx,
        deltaY: dy,
      })
    );

  const panBy = async (dx: number, dy = 0) => {
    wheelPan(dx, dy);
    await nextFrame();
    await nextFrame();
    await nextFrame();
  };

  const seededCrossings = async () => {
    const checked: Array<{
      arrows: Array<{
        id: string;
        misplaced: string | null;
        mounted: boolean;
        view: SeededCrossing['view'];
      }>;
      crosses: boolean;
      shapeId: string;
      view: SeededCrossing['view'];
    }> = [];

    for (const { shapeId, view } of prepared.fixture.crossings) {
      const camera = readCamera();
      const target = cameraFor(view, prepared.fixture, prepared.offset);

      if (target.zoom !== camera.zoom) {
        throw new Error(`the ${view} view's zoom differs from the camera's`);
      }
      await panBy(
        (target.x - camera.x) * camera.zoom,
        (target.y - camera.y) * camera.zoom
      );
      const arrows = await crossingArrows();

      checked.push({
        arrows: arrows.map((arrow) => ({ ...arrow, view })),
        crosses: arrows.some((arrow) => arrow.id === shapeId),
        shapeId,
        view,
      });
    }

    return checked;
  };

  const probe = {
    scrollToBoard: async () => {
      const surface = surfaceRect();

      if (surface) window.scrollBy(0, surface.top - 8);
      await nextFrame();
      await nextFrame();
    },
    expected: prepared.expected,
    frameInterval: measureFrameInterval,
    misplaced,
    plantWork,
    query,
    readback,
    ready: null as null | {
      mountedNow: number;
      mountMs: number;
      mounts: number;
    },
    stats: boardStats,

    coreWork: () => {
      const { selectorVisits, subscriberVisits } = readCoreWork();

      return { selectorVisits, subscriberVisits };
    },

    placeCaret: async () => {
      const host = textHost();
      const root = editable();
      const node = host
        ? document.createTreeWalker(host, NodeFilter.SHOW_TEXT).nextNode()
        : null;

      if (!host || !root || !node) {
        throw new Error(`no typed text at ${textPath.join(',')}`);
      }

      const surface = surfaceRect();

      if (surface) window.scrollBy(0, surface.top - 8);
      else host.scrollIntoView({ block: 'center' });
      root.focus({ preventScroll: true });
      document.getSelection()?.collapse(node, 0);

      for (let frame = 0; frame < 120; frame++) {
        await nextFrame();
        const selection = editor.read.selection();

        if (
          selection &&
          (selection.anchor.root ?? null) === typedRoot &&
          selection.anchor.path.join(',') === textPath.join(',') &&
          selection.anchor.offset === 0 &&
          selection.focus.offset === 0
        ) {
          return;
        }
      }

      throw new Error(
        `the model selection never reached ${textPath.join(',')}:0: ${JSON.stringify(editor.read.selection())}`
      );
    },

    pendingCount: () =>
      prepared.typedShapeId
        ? pendingShapesOf(storedValue(), editor.read.authored.changes).length
        : 0,

    typedText,

    isMounted,

    seededCrossings,

    panBy,

    shapesInView: () => shapesInView().length,

    selectionState: () => {
      const selection = editor.read.selection();
      const dom = document.getSelection();
      const typed = prepared.typedShapeId
        ? document.querySelector(`[data-shape-id="${prepared.typedShapeId}"]`)
        : null;
      const inTyped = (node: Node | null | undefined) =>
        Boolean(typed && node && typed.contains(node));

      const anchorElement =
        dom?.anchorNode instanceof Element
          ? dom.anchorNode
          : dom?.anchorNode?.parentElement;

      return {
        anchor: selection?.anchor ?? null,
        domAnchor: anchorElement
          ? `${anchorElement.tagName} ${anchorElement.getAttribute('data-editor-path') ?? ''}`
          : null,
        domInTyped: inTyped(dom?.anchorNode) && inTyped(dom?.focusNode),
        typedCount: prepared.typedShapeId
          ? document.querySelectorAll(
              `[data-shape-id="${prepared.typedShapeId}"]`
            ).length
          : 0,
        domText: dom?.toString() ?? '',
        focus: selection?.focus ?? null,
        typedMounted: typed !== null,
      };
    },

    peerEdit: async (text: string) => {
      const shapes = storedBoard() ?? [];
      const camera = readCamera();
      const right = camera.x + VIEWPORT.width / camera.zoom;
      const bottom = camera.y + VIEWPORT.height / camera.zoom;
      const [target] = shapes
        .map((shape, index) => ({
          box: shapeBox(shape),
          index,
          shape,
        }))
        .filter(
          ({ box, shape }) =>
            shape.type === 'boardNote' &&
            box.x > right &&
            box.y >= camera.y &&
            box.y + box.height <= bottom
        )
        .sort((left, other) => left.box.x - other.box.x);

      if (!target) throw new Error('no note right of the view to edit');
      const shapeId = target.shape.shapeId ?? '';
      const mountedBefore = isMounted(shapeId);
      const before = { ...boardStats };

      rootUpdate((tx) =>
        tx.text.insert(text, {
          at: { offset: 0, path: [target.index, 0, 0] },
        })
      );
      await nextFrame();
      await nextFrame();

      return {
        boardRenders: boardStats.boardRenders - before.boardRenders,
        dx: target.box.x + target.box.width - right + 8,
        geometryScans: boardStats.geometryScans - before.geometryScans,
        mountedBefore,
        shapeId,
        visibilityRecomputes:
          boardStats.visibilityRecomputes - before.visibilityRecomputes,
      };
    },

    moveIntoView: async (shapeId: string) => {
      const index = (storedBoard() ?? []).findIndex(
        (shape) => shape.shapeId === shapeId
      );
      const camera = readCamera();
      const before = boardStats.indexBuilds;

      rootUpdate((tx) =>
        tx.nodes.set(
          { place: { x: camera.x + 40, y: camera.y + 40 } },
          { at: [index] }
        )
      );
      await nextFrame();
      await nextFrame();

      return {
        indexBuilds: boardStats.indexBuilds - before,
        mounted: isMounted(shapeId),
        misplaced: await misplaced(),
      };
    },

    reindexMidPan: async (dx: number) => {
      const mounted = new Set(
        shapeElements().map((element) => element.dataset.shapeId ?? '')
      );
      const shapes = storedBoard() ?? [];
      const index = shapes.findIndex(
        (shape) =>
          shape.place !== undefined && !mounted.has(shape.shapeId ?? '')
      );
      const place = shapes[index]?.place;

      if (!place) throw new Error('no unmounted shape to move');
      const before = { ...boardStats };

      wheelPan(dx);
      rootUpdate((tx) =>
        tx.nodes.set({ place: { ...place, x: place.x + 1 } }, { at: [index] })
      );
      for (let frame = 0; frame < 4; frame++) await nextFrame();
      const inView = new Set(shapesInView());

      return {
        indexBuilds: boardStats.indexBuilds - before.indexBuilds,
        keptOutOfView: [...mounted].filter(
          (shapeId) =>
            shapeId !== prepared.typedShapeId &&
            isMounted(shapeId) &&
            !inView.has(shapeId)
        ),
        mountedBefore: mounted.size,
        motionUnmounts: boardStats.motionUnmounts - before.motionUnmounts,
      };
    },

    shapeText: (shapeId: string) =>
      document.querySelector(`[data-shape-id="${shapeId}"]`)?.textContent ??
      null,

    startTyping: () => {
      const root = editable();
      const before = typedText();

      if (!root || before === null) {
        throw new Error('no typed text to type into');
      }
      typing = { before, current: null };
      samples.length = 0;
      observer.observe(root, {
        characterData: true,
        childList: true,
        subtree: true,
      });

      return before;
    },

    waitKey: (count: number, timeoutMs: number) =>
      new Promise<string | null>((resolve) => {
        const deadline = performance.now() + timeoutMs;
        const check = () => {
          const sample = samples[count - 1];

          if (sample?.frameEnd !== undefined) {
            onFrameEnd = null;
            setTimeout(() => resolve(null), keydownSpreadMs(count));

            return;
          }
          if (performance.now() > deadline) {
            onFrameEnd = null;
            resolve(
              !sample
                ? `key ${count} reached no keydown listener`
                : sample.mutated === undefined
                  ? `key ${count} produced no mutation record of the character; the note reads ${JSON.stringify(typedText()?.slice(0, 40))}`
                  : `key ${count} produced no frame sample`
            );

            return;
          }
          setTimeout(check, 50);
        };

        onFrameEnd = check;
        check();
      }),

    finishTyping: () => {
      observer.disconnect();
      typing = null;

      return samples.map((sample) => ({
        extraMs: sample.extraMs,
        n1: (sample.mutated ?? Number.NaN) - sample.keydown,
        n2: (sample.frameEnd ?? Number.NaN) - sample.stamp,
        trusted: sample.trusted,
      }));
    },

    gesture: async (mode: 'pan' | 'zoom', durationMs: number, step: number) => {
      const layer = boardLayer();
      const surface = layer?.parentElement;

      if (!layer || !surface) throw new Error('no board surface to pan');
      const interval = await measureFrameInterval();
      const corner = surface.getBoundingClientRect();
      const start = readCamera();
      const before = { ...boardStats };
      const stamps: number[] = [];
      const wrong: string[] = [];
      let expected = { ...start };
      let frames = 0;
      const began = await nextFrame();
      let now = began;

      while (now - began < durationMs) {
        const matrix = readBoardTransform();

        if (!matrix) throw new Error('no board transform to read');
        const read = {
          x: -matrix.e / matrix.a,
          y: -matrix.f / matrix.d,
          zoom: matrix.a,
        };

        // A computed transform prints six significant digits, so the read
        // camera carries that rounding; a skipped or ignored step is whole
        // pixels or a 0.35% zoom off.
        const slack = (value: number) => 0.05 + Math.abs(value) * 2e-5;

        if (
          Math.abs(read.zoom - expected.zoom) > 2e-5 * expected.zoom ||
          Math.abs(read.x - expected.x) > slack(expected.x) ||
          Math.abs(read.y - expected.y) > slack(expected.y)
        ) {
          wrong.push(
            `frame ${frames}: camera ${JSON.stringify(read)} not ${JSON.stringify(expected)}`
          );
        }
        surface.dispatchEvent(
          new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: corner.left,
            clientY: corner.top,
            ctrlKey: mode === 'zoom',
            deltaX: mode === 'pan' ? step : 0,
            deltaY: mode === 'zoom' ? -step : 0,
          })
        );
        expected =
          mode === 'pan'
            ? { ...expected, x: expected.x + step / expected.zoom }
            : { ...expected, zoom: expected.zoom * 2 ** (step / 100) };
        frames += 1;
        now = await nextFrame();
        stamps.push(now);
      }

      const gaps = stamps.slice(1).map((stamp, index) => stamp - stamps[index]);
      const end = readCamera();

      return {
        documentChanges: boardStats.valueChanges - before.valueChanges,
        dropped: gaps.filter((gap) => gap > 1.5 * interval).length,
        end,
        expectedEnd: expected,
        frames,
        interval,
        shapeMounts: boardStats.mounts - before.mounts,
        shapeRenders: boardStats.renders - before.renders,
        shapeUpdates: boardStats.updates - before.updates,
        start,
        visibilityRecomputes:
          boardStats.visibilityRecomputes - before.visibilityRecomputes,
        wrongFrames: wrong,
      };
    },

    frameGrabPoint: () => {
      const frame = document.querySelector<HTMLElement>(
        '[data-shape-type="boardFrame"]'
      );
      const rect = frame?.getBoundingClientRect();

      if (!frame || !rect) return null;
      const { zoom } = readCamera();
      const betweenMemberColumnsX = 180;
      const insideFrameEdgeBandY = 4;

      return {
        id: frame.dataset.shapeId ?? '',
        x: rect.left + betweenMemberColumnsX * zoom,
        y: rect.top + insideFrameEdgeBandY,
      };
    },

    startDrag: (frameId: string, interval: number) => {
      const surface = surfaceRect();

      if (!surface) throw new Error('no board surface to drag on');
      const meets = (rect: ScreenRect) =>
        rect.right > surface.left &&
        rect.left < surface.right &&
        rect.bottom > surface.top &&
        rect.top < surface.bottom;
      const shapes = storedBoard() ?? [];
      const byId = shapesById(shapes);
      const { zoom } = readCamera();
      const carried = new Set(
        shapes.flatMap((shape) =>
          shape.shapeId === frameId || shape.frame === frameId
            ? [shape.shapeId ?? '']
            : []
        )
      );
      const bound = shapes.filter(
        ({ end, start }) =>
          start && end && (carried.has(start.shape) || carried.has(end.shape))
      );
      const dragged = shapes.flatMap((shape) =>
        carried.has(shape.shapeId ?? '')
          ? [
              {
                id: shape.shapeId ?? '',
                origin: screenRect(shapeBox(shape), surface),
              },
            ]
          : []
      );
      const own = dragged.find(({ id }) => id === frameId);

      if (!own) throw new Error(`no frame ${frameId}`);
      const members = dragged.filter((each) => each !== own);
      const membersInView = members.filter(({ origin }) =>
        meets(origin)
      ).length;
      const boundIds = new Set(bound.map((arrow) => arrow.shapeId ?? ''));
      const inDrag = new Set([...carried, ...boundIds]);
      const elementsInView = (keep: (id: string) => boolean) =>
        shapeElements().filter(
          (element) =>
            keep(element.dataset.shapeId ?? '') &&
            meets(element.getBoundingClientRect())
        );
      const nonMemberIds = new Set(
        shapeElements().flatMap((element) => {
          const id = element.dataset.shapeId ?? '';

          return inDrag.has(id) ? [] : [id];
        })
      );
      const rendersBefore = new Map(boardStats.renderedIds);
      const changesBefore = boardStats.valueChanges;
      const inView = elementsInView((id) => nonMemberIds.has(id));
      const boundInView = elementsInView((id) => boundIds.has(id)).map(
        (element) => element.dataset.shapeId ?? ''
      );
      const fixedRects = inView.map((element) =>
        element.getBoundingClientRect()
      );
      const moves: DragMove[] = [];
      let down: { x: number; y: number } | null = null;
      const port = new MessageChannel();
      let pending: {
        after: number;
        stamp: number;
        x: number;
        y: number;
      } | null = null;
      let lastFrame = Number.NEGATIVE_INFINITY;
      let looping = true;
      const loop = (stamp: number) => {
        if (!looping) return;
        lastFrame = stamp;
        port.port2.postMessage({ stamp, started: performance.now() });
        requestAnimationFrame(loop);
      };

      // The message lands after the frame's rendering, so a renderer that
      // moves the preview in its own rAF callback has moved it by then.
      port.port1.addEventListener(
        'message',
        (event: MessageEvent<{ stamp: number; started: number }>) => {
          if (!pending || !down || event.data.stamp <= pending.after) return;
          const dx = pending.x - down.x;
          const dy = pending.y - down.y;
          const shifted = ({ origin }: (typeof dragged)[number]) => ({
            bottom: origin.bottom + dy,
            left: origin.left + dx,
            right: origin.right + dx,
            top: origin.top + dy,
          });
          const placed = (each: (typeof dragged)[number]) => {
            const rect = document
              .querySelector(`[data-shape-id="${each.id}"]`)
              ?.getBoundingClientRect();
            const want = shifted(each);

            return rect
              ? Math.abs(rect.left - want.left) <= 1 &&
                  Math.abs(rect.top - want.top) <= 1
              : null;
          };
          let membersMissing = 0;
          let membersOff = 0;

          for (const member of members) {
            if (!meets(shifted(member))) continue;
            const at = placed(member);

            if (at === null) membersMissing += 1;
            else if (!at) membersOff += 1;
          }

          const movedTargets = targetsOf(byId, carried, {
            x: dx / zoom,
            y: dy / zoom,
          });
          let arrowsBehind = 0;

          for (const arrow of bound) {
            const want = screenRect(drawnBox(arrow, movedTargets), surface);

            if (!meets(want)) continue;
            const rect = document
              .querySelector(`[data-shape-id="${arrow.shapeId}"]`)
              ?.getBoundingClientRect();

            if (!rect || rectOff(rect, want, 1)) arrowsBehind += 1;
          }

          moves.push({
            arrowsBehind,
            atPointer: placed(own) === true,
            // A frame's own stamp can name a vsync it started after, so the
            // count reads when its callbacks ran. The quarter frame absorbs a
            // measured interval that rounds the display's down.
            frames: Math.floor(
              (event.data.started - pending.after) / interval +
                QUARTER_FRAME_SLACK
            ),
            membersMissing,
            membersOff,
            ms: performance.now() - pending.stamp,
          });
          pending = null;
        }
      );
      port.port1.start();
      requestAnimationFrame(loop);
      const onDown = (event: PointerEvent) => {
        down = { x: event.clientX, y: event.clientY };
      };
      const onMove = (event: PointerEvent) => {
        if (!down) return;
        pending = {
          after: lastFrame,
          stamp: event.timeStamp,
          x: event.clientX,
          y: event.clientY,
        };
        if (plant === 'drag-busy') {
          busyWait(Math.max(0, lastFrame + 2 * interval - performance.now()));
        }
      };

      let changesBeforeRelease: number | null = null;
      const snapshotBeforeRelease = () => {
        changesBeforeRelease ??= boardStats.valueChanges;
      };

      window.addEventListener('pointerdown', onDown, true);
      window.addEventListener('pointermove', onMove, true);
      window.addEventListener('pointerup', snapshotBeforeRelease, true);

      drag = {
        count: () => moves.length,
        finish: () => {
          looping = false;
          window.removeEventListener('pointerdown', onDown, true);
          window.removeEventListener('pointermove', onMove, true);
          window.removeEventListener('pointerup', snapshotBeforeRelease, true);
          const ended = changesBeforeRelease ?? boardStats.valueChanges;
          const moved = inView.flatMap((element, index) => {
            const rect = element.getBoundingClientRect();
            const dx = rect.left - fixedRects[index].left;
            const dy = rect.top - fixedRects[index].top;

            return Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5
              ? [
                  `${element.dataset.shapeId ?? ''} by ${dx.toFixed(1)},${dy.toFixed(1)}${element.isConnected ? '' : ' detached'}`,
                ]
              : [];
          });
          const rendersOf = (id: string) =>
            (boardStats.renderedIds.get(id) ?? 0) -
            (rendersBefore.get(id) ?? 0);
          let nonMemberRenders = 0;

          for (const id of nonMemberIds) nonMemberRenders += rendersOf(id);

          return {
            boundArrowsInView: boundInView.length,
            boundArrowsRedrawn: boundInView.filter((id) => rendersOf(id) > 0)
              .length,
            members: shapeElements().filter((element) =>
              carried.has(element.dataset.shapeId ?? '')
            ).length,
            membersInView,
            moves,
            nonMemberRenders,
            nonMembersChecked: inView.length,
            nonMembersMoved: moved,
            releaseWrites: boardStats.valueChanges - ended,
            writes: ended - changesBefore,
          };
        },
      };
    },

    dragCount: () => drag?.count() ?? 0,

    k2Setup: () => {
      const shapes = storedBoard() ?? [];
      const camera = readCamera();
      const view = viewRect(camera);
      const surface = surfaceRect();

      if (!surface) throw new Error('no board surface for K2');
      const middle = {
        x: (view.left + view.right) / 2,
        y: (view.top + view.bottom) / 2,
      };
      const note = (shape: StoredNode | undefined): shape is StoredNode =>
        shape?.type === 'boardNote' &&
        shape.shapeId !== prepared.typedShapeId &&
        fullyIn(shapeBox(shape), view) &&
        isMounted(shape.shapeId ?? '');
      let best: { at: number; distance: number } | null = null;

      for (let at = 1; at < shapes.length - 1; at++) {
        const [left, start, right] = shapes.slice(at - 1, at + 2);

        if (!note(left) || !note(start) || !note(right)) continue;
        const [l, s, r] = [left, start, right].map(shapeBox);

        if (l.y !== s.y || r.y !== s.y || !(l.x < s.x && s.x < r.x)) continue;
        const distance = Math.hypot(
          s.x + s.width / 2 - middle.x,
          s.y + s.height / 2 - middle.y
        );

        if (!best || distance < best.distance) best = { at, distance };
      }
      if (!best) {
        throw new Error('K2 found no note in view with notes on both sides');
      }
      shapeAtLineEnd = indexLineEnds(shapes);
      const [left, start, right] = shapes.slice(best.at - 1, best.at + 2);
      const s = screenRect(shapeBox(start), surface, camera);
      const r = screenRect(shapeBox(right), surface, camera);

      return {
        gapAboveArrows: {
          x: (s.right + r.left) / 2,
          y: s.top + ABOVE_ARROWS_PX,
        },
        left: left.shapeId ?? '',
        places: {
          [left.shapeId ?? '']: best.at,
          [right.shapeId ?? '']: best.at + 2,
          [start.shapeId ?? '']: best.at + 1,
        },
        right: right.shapeId ?? '',
        rightCenter: { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 },
        start: start.shapeId ?? '',
        startCenter: { x: (s.left + s.right) / 2, y: (s.top + s.bottom) / 2 },
        startGrab: { x: s.left + 6, y: s.top + 6 },
        total: shapes.length,
      };
    },

    k2State: () => {
      const end = aimLineEnd();
      const view = typedView();

      return {
        aimed: end === null ? null : aimedShapeAt(end),
        selected: selectedShapes(),
        tool: view && 'tool' in view ? (view.tool ?? null) : null,
      };
    },

    k2Count: () => rootShapes().length,

    k2Shape: (id: string) => {
      const shape = rootShapes().find((each) => each.shapeId === id);

      return shape
        ? {
            end: shape.end?.shape ?? null,
            start: shape.start?.shape ?? null,
            type: shape.type ?? '',
          }
        : null;
    },

    k2Arm: (arm: K2Arm) => {
      k2Observer.disconnect();
      k2 = {
        arm,
        before: null,
        known: new Set(
          arm.done.kind === 'shapeAdded'
            ? rootShapes().map((shape) => shape.shapeId ?? '')
            : []
        ),
        lineBefore: aimLineEnd(),
        notify: null,
        sample: null,
        settled: false,
      };
      const host = boardHost();

      if (!host) throw new Error('no board for K2 to watch');
      k2Observer.observe(host, {
        attributeFilter: ['data-board-shape', 'data-selected', 'x2', 'y2'],
        attributes: true,
        childList: true,
        subtree: true,
      });
      if (!arm.said) return;
      for (const region of document.querySelectorAll(LIVE_REGION)) {
        k2Observer.observe(region, {
          characterData: true,
          childList: true,
          subtree: true,
        });
      }
    },

    k2Wait: (timeoutMs: number) =>
      new Promise<string | null>((resolve) => {
        const armed = k2;

        if (!armed) {
          resolve('no K2 operation was armed');

          return;
        }
        const timer = setTimeout(() => {
          armed.notify = null;
          k2Observer.disconnect();
          resolve(
            !armed.sample
              ? 'reached no listener'
              : armed.sample.resultAt === undefined
                ? 'changed no DOM it waits for'
                : armed.sample.done === undefined
                  ? `said no words ending ${JSON.stringify(armed.arm.said?.end)} for its result ${String(k2ResultOf(armed.arm, armed.sample.result))}`
                  : 'never settled'
          );
        }, timeoutMs);

        armed.notify = () => {
          clearTimeout(timer);
          resolve(null);
        };
        if (armed.settled) armed.notify();
      }),

    k2Take: () => {
      const sample = k2?.sample ?? null;
      const arm = k2?.arm;

      k2 = null;
      if (!sample || !arm) return null;

      return { ...sample, result: k2ResultOf(arm, sample.result) };
    },

    holdUntilViewsSettle: async () => {
      while (!renderer.viewsSettled()) await nextFrame();
    },

    finishDrag: () => {
      if (!drag) throw new Error('no drag was started');
      const result = drag.finish();
      drag = null;

      return result;
    },
  };

  Object.assign(window, { __BOARD_SCALE__: probe });

  return probe;
};

export type BoardProbe = ReturnType<typeof installBoardProbe>;

import type { Locator } from '@playwright/test';

import type {
  SlateBrowserNativeEventTraceAnomaly,
  SlateBrowserNativeEventTraceDOMDelta,
  SlateBrowserNativeEventTraceEntry,
  SlateBrowserNativeEventTraceNodeSnapshot,
  SlateBrowserNativeEventTraceOptions,
  SlateBrowserNativeEventTraceRect,
  SlateBrowserNativeEventTraceSelectionSnapshot,
  SlateBrowserNativeEventTraceSnapshot,
  SlateBrowserNativeEventTraceTargetRangeSnapshot,
  SlateBrowserNativeEventTraceTextNodeDelta,
  SlateBrowserNativeEventTraceTextNodeSnapshot,
  SlateBrowserNativeEventTraceType,
} from './types';

const NATIVE_EVENT_TRACE_KEY = '__SLATE_BROWSER_NATIVE_EVENT_TRACE__';

/** Start native event tracing for a Slate browser root. */
export const startSlateBrowserNativeEventTrace = async (
  root: Locator,
  options: SlateBrowserNativeEventTraceOptions = {}
) => {
  await root.evaluate(
    (
      element: HTMLElement,
      {
        key,
        options,
      }: { key: string; options: SlateBrowserNativeEventTraceOptions }
    ) => {
      const previous = (element as Record<string, any>)[key] as
        | { stop?: () => void }
        | undefined;

      previous?.stop?.();

      const maxEntries = Math.max(1, options.maxEntries ?? 100);
      const enabledEvents = new Set<SlateBrowserNativeEventTraceType>(
        options.events ?? [
          'selectionchange',
          'beforeinput',
          'input',
          'compositionstart',
          'compositionupdate',
          'compositionend',
        ]
      );
      const entries: SlateBrowserNativeEventTraceEntry[] = [];
      const anomalies: SlateBrowserNativeEventTraceAnomaly[] = [];
      const nodeIds = new WeakMap<Text, string>();
      let nodeId = 0;
      let beforeInputTextNodes:
        | SlateBrowserNativeEventTraceTextNodeSnapshot[]
        | null = null;
      let lastBeforeInput: SlateBrowserNativeEventTraceEntry | null = null;
      let lastComposition: SlateBrowserNativeEventTraceEntry | null = null;

      const rootNode = element.getRootNode() as Document | ShadowRoot;
      const ownerDocument = element.ownerDocument;

      const getRootSelection = () =>
        'getSelection' in rootNode
          ? rootNode.getSelection()
          : ownerDocument.getSelection();

      const getParentSignature = (parent: Element | null) => {
        if (!parent) {
          return null;
        }

        const path = parent
          .closest('[data-slate-node="text"]')
          ?.getAttribute('data-slate-path');
        const ownPath = parent.getAttribute('data-slate-path');
        const directParent = parent.parentElement;
        const sameTagIndex = directParent
          ? Array.from(directParent.children)
              .filter((sibling) => sibling.tagName === parent.tagName)
              .indexOf(parent)
          : 0;

        return `${parent.tagName.toLowerCase()}[${sameTagIndex}]${
          ownPath ? `[path=${ownPath}]` : ''
        }${path ? `[text=${path}]` : ''}`;
      };

      const getNodeSnapshot = (
        node: Node | null
      ): SlateBrowserNativeEventTraceNodeSnapshot => {
        if (!node) {
          return {
            nodeName: null,
            parentNodeName: null,
            parentPath: null,
            parentSignature: null,
            path: null,
            text: null,
          };
        }

        const elementNode =
          node.nodeType === Node.ELEMENT_NODE ? (node as Element) : null;
        const parent =
          node.nodeType === Node.TEXT_NODE
            ? node.parentElement
            : (elementNode?.parentElement ?? null);
        const textNodeOwner = (elementNode ?? parent)?.closest(
          '[data-slate-node="text"]'
        );

        return {
          nodeName: node.nodeName,
          parentNodeName: parent?.nodeName ?? null,
          parentPath: parent?.getAttribute('data-slate-path') ?? null,
          parentSignature: getParentSignature(parent),
          path: textNodeOwner?.getAttribute('data-slate-path') ?? null,
          text: node.textContent ?? null,
        };
      };

      const takeSelection =
        (): SlateBrowserNativeEventTraceSelectionSnapshot => {
          const selection = getRootSelection();

          if (!selection || selection.rangeCount === 0) {
            return {
              anchor: null,
              anchorOffset: null,
              collapsed: null,
              focus: null,
              focusOffset: null,
              rangeCount: selection?.rangeCount ?? 0,
              selectedText: '',
            };
          }

          return {
            anchor: getNodeSnapshot(selection.anchorNode),
            anchorOffset: selection.anchorOffset,
            collapsed: selection.isCollapsed,
            focus: getNodeSnapshot(selection.focusNode),
            focusOffset: selection.focusOffset,
            rangeCount: selection.rangeCount,
            selectedText: (selection.toString() ?? '').replace(/\uFEFF/g, ''),
          };
        };

      const toRectSnapshots = (
        rects: DOMRectList | readonly DOMRect[]
      ): SlateBrowserNativeEventTraceRect[] =>
        Array.from(rects).map((rect) => ({
          height: rect.height,
          width: rect.width,
          x: rect.x,
          y: rect.y,
        }));

      const takeTargetRanges = (
        event: InputEvent
      ): SlateBrowserNativeEventTraceTargetRangeSnapshot[] => {
        const ranges = event.getTargetRanges?.() ?? [];

        return Array.from(ranges).map((range) => {
          let rects: SlateBrowserNativeEventTraceRect[] = [];

          try {
            const liveRange = ownerDocument.createRange();

            liveRange.setStart(range.startContainer, range.startOffset);
            liveRange.setEnd(range.endContainer, range.endOffset);
            rects = toRectSnapshots(liveRange.getClientRects());
          } catch {
            rects = [];
          }

          return {
            collapsed: range.collapsed,
            end: getNodeSnapshot(range.endContainer),
            endOffset: range.endOffset,
            rects,
            start: getNodeSnapshot(range.startContainer),
            startOffset: range.startOffset,
          };
        });
      };

      const getTextNodeId = (textNode: Text) => {
        let id = nodeIds.get(textNode);

        if (!id) {
          id = `text-${++nodeId}`;
          nodeIds.set(textNode, id);
        }

        return id;
      };

      const snapshotTextNodes =
        (): SlateBrowserNativeEventTraceTextNodeSnapshot[] => {
          const snapshot: SlateBrowserNativeEventTraceTextNodeSnapshot[] = [];
          const walker = ownerDocument.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
          );
          let node = walker.nextNode();

          while (node) {
            const textNode = node as Text;
            const parent = textNode.parentElement;

            if (parent) {
              snapshot.push({
                id: getTextNodeId(textNode),
                parentPath: parent.getAttribute('data-slate-path'),
                parentSignature: getParentSignature(parent) ?? parent.nodeName,
                text: textNode.data,
              });
            }

            node = walker.nextNode();
          }

          return snapshot;
        };

      const diffTextNodes = (
        before: SlateBrowserNativeEventTraceTextNodeSnapshot[] | null,
        after: SlateBrowserNativeEventTraceTextNodeSnapshot[]
      ): SlateBrowserNativeEventTraceDOMDelta | null => {
        if (!before) {
          return null;
        }

        const deltas: SlateBrowserNativeEventTraceTextNodeDelta[] = [];
        const afterById = new Map(after.map((node) => [node.id, node]));
        const beforeById = new Map(before.map((node) => [node.id, node]));

        for (const beforeNode of before) {
          const afterNode = afterById.get(beforeNode.id);

          if (!afterNode) {
            deltas.push({ after: null, before: beforeNode, type: 'deleted' });
          } else if (beforeNode.text !== afterNode.text) {
            deltas.push({
              after: afterNode,
              before: beforeNode,
              type: 'modified',
            });
          } else if (beforeNode.parentSignature !== afterNode.parentSignature) {
            deltas.push({
              after: afterNode,
              before: beforeNode,
              type: 'moved',
            });
          }
        }

        for (const afterNode of after) {
          if (!beforeById.has(afterNode.id)) {
            deltas.push({ after: afterNode, before: null, type: 'added' });
          }
        }

        return { textNodes: deltas };
      };

      const addAnomaly = (
        type: SlateBrowserNativeEventTraceAnomaly['type'],
        detail: string
      ) => {
        anomalies.push({ detail, type });
      };

      const detectInputAnomalies = (
        entry: SlateBrowserNativeEventTraceEntry
      ) => {
        if (
          !lastBeforeInput ||
          entry.timestamp - lastBeforeInput.timestamp > 100
        ) {
          addAnomaly(
            'missing-beforeinput',
            `inputType=${entry.inputType ?? 'unknown'}`
          );
          return;
        }

        if (
          lastBeforeInput.inputType &&
          entry.inputType &&
          lastBeforeInput.inputType !== entry.inputType
        ) {
          addAnomaly(
            'inputtype-mismatch',
            `${lastBeforeInput.inputType} -> ${entry.inputType}`
          );
        }

        if (
          lastBeforeInput.data &&
          entry.data &&
          !lastBeforeInput.data.includes(entry.data) &&
          !entry.data.includes(lastBeforeInput.data)
        ) {
          addAnomaly(
            'data-content-mismatch',
            `beforeinput="${lastBeforeInput.data}" input="${entry.data}"`
          );
        }

        const beforeAnchor = lastBeforeInput.selection.anchor;
        const inputAnchor = entry.selection.anchor;

        if (beforeAnchor?.path && inputAnchor?.path) {
          if (beforeAnchor.path !== inputAnchor.path) {
            addAnomaly(
              'parent-mismatch',
              `${beforeAnchor.path} -> ${inputAnchor.path}`
            );
          } else if (
            lastBeforeInput.inputType?.startsWith('insert') &&
            lastBeforeInput.data &&
            lastBeforeInput.selection.anchorOffset != null &&
            entry.selection.anchorOffset != null
          ) {
            const expected =
              lastBeforeInput.selection.anchorOffset +
              lastBeforeInput.data.length;
            const delta = Math.abs(entry.selection.anchorOffset - expected);

            if (delta > 4) {
              addAnomaly(
                'selection-jump',
                `expected offset ${expected}, got ${entry.selection.anchorOffset}`
              );
            }
          }
        }

        if (
          beforeAnchor?.nodeName &&
          inputAnchor?.nodeName &&
          beforeAnchor.nodeName !== inputAnchor.nodeName
        ) {
          addAnomaly(
            'node-type-change',
            `${beforeAnchor.nodeName} -> ${inputAnchor.nodeName}`
          );
        }

        if (entry.domDelta?.textNodes.some((node) => node.type === 'added')) {
          addAnomaly('sibling-created', 'input created a new text node');
        }
      };

      const detectCompositionAnomalies = (
        entry: SlateBrowserNativeEventTraceEntry
      ) => {
        if (
          lastComposition?.data &&
          entry.data &&
          !lastComposition.data.includes(entry.data) &&
          !entry.data.includes(lastComposition.data)
        ) {
          addAnomaly(
            'composition-mismatch',
            `composition="${lastComposition.data}" event="${entry.data}"`
          );
        }
      };

      const pushEntry = (entry: SlateBrowserNativeEventTraceEntry) => {
        entries.push(entry);

        if (entries.length > maxEntries) {
          entries.splice(0, entries.length - maxEntries);
        }
      };

      const record = (event: Event) => {
        const type = event.type as SlateBrowserNativeEventTraceType;

        if (!enabledEvents.has(type)) {
          return;
        }

        const inputEvent =
          event instanceof InputEvent ? event : (null as InputEvent | null);
        const compositionEvent =
          event instanceof CompositionEvent
            ? event
            : (null as CompositionEvent | null);

        if (type === 'beforeinput') {
          beforeInputTextNodes = snapshotTextNodes();
        }

        const entry: SlateBrowserNativeEventTraceEntry = {
          data: inputEvent?.data ?? compositionEvent?.data ?? null,
          domDelta:
            type === 'input'
              ? diffTextNodes(beforeInputTextNodes, snapshotTextNodes())
              : null,
          inputType: inputEvent?.inputType ?? null,
          isComposing: inputEvent?.isComposing ?? null,
          selection: takeSelection(),
          targetRanges: inputEvent ? takeTargetRanges(inputEvent) : [],
          timestamp: Date.now(),
          type,
        };

        if (type === 'input') {
          detectInputAnomalies(entry);
        } else if (type === 'beforeinput') {
          lastBeforeInput = entry;
        } else if (type.startsWith('composition')) {
          detectCompositionAnomalies(entry);
          lastComposition = entry;
        }

        pushEntry(entry);
      };

      const eventTypes: SlateBrowserNativeEventTraceType[] = [
        'beforeinput',
        'input',
        'compositionstart',
        'compositionupdate',
        'compositionend',
      ];

      eventTypes.forEach((type) => {
        element.addEventListener(type, record, { capture: true });
      });
      ownerDocument.addEventListener('selectionchange', record);

      (element as Record<string, any>)[key] = {
        anomalies,
        entries,
        reset() {
          entries.length = 0;
          anomalies.length = 0;
          beforeInputTextNodes = null;
          lastBeforeInput = null;
          lastComposition = null;
        },
        stop() {
          eventTypes.forEach((type) => {
            element.removeEventListener(type, record, { capture: true });
          });
          ownerDocument.removeEventListener('selectionchange', record);
        },
      };
    },
    { key: NATIVE_EVENT_TRACE_KEY, options }
  );
};

/** Clear the current native event trace for a Slate browser root. */
export const resetSlateBrowserNativeEventTrace = async (root: Locator) => {
  await root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      (element as Record<string, any>)[key]?.reset?.();
    },
    { key: NATIVE_EVENT_TRACE_KEY }
  );
};

/** Stop native event tracing for a Slate browser root. */
export const stopSlateBrowserNativeEventTrace = async (root: Locator) => {
  await root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      (element as Record<string, any>)[key]?.stop?.();
      delete (element as Record<string, any>)[key];
    },
    { key: NATIVE_EVENT_TRACE_KEY }
  );
};

/** Read the native event trace captured for a Slate browser root. */
export const takeSlateBrowserNativeEventTrace = async (
  root: Locator
): Promise<SlateBrowserNativeEventTraceSnapshot> =>
  root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const trace = (element as Record<string, any>)[key];

      return {
        anomalies:
          trace?.anomalies?.map(
            (anomaly: SlateBrowserNativeEventTraceAnomaly) => ({ ...anomaly })
          ) ?? [],
        entries:
          trace?.entries?.map((entry: SlateBrowserNativeEventTraceEntry) => ({
            ...entry,
            domDelta: entry.domDelta
              ? {
                  textNodes: entry.domDelta.textNodes.map((node) => ({
                    after: node.after ? { ...node.after } : null,
                    before: node.before ? { ...node.before } : null,
                    type: node.type,
                  })),
                }
              : null,
            selection: {
              ...entry.selection,
              anchor: entry.selection.anchor
                ? { ...entry.selection.anchor }
                : null,
              focus: entry.selection.focus
                ? { ...entry.selection.focus }
                : null,
            },
            targetRanges: entry.targetRanges.map((range) => ({
              ...range,
              end: { ...range.end },
              rects: range.rects.map((rect) => ({ ...rect })),
              start: { ...range.start },
            })),
          })) ?? [],
      } satisfies SlateBrowserNativeEventTraceSnapshot;
    },
    { key: NATIVE_EVENT_TRACE_KEY }
  );

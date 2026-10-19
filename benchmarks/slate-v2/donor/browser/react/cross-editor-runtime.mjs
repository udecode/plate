const frames = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => resolve(performance.now())),
    ),
  );

export const installRuntime = (mount) => {
  let adapter;
  let operation;
  let detach = () => {};
  let detachDocumentEvents = () => {};
  const events = [
    'keydown',
    'beforeinput',
    'input',
    'paste',
    'copy',
    'cut',
    'pointerdown',
    'click',
    'dblclick',
    'focusin',
    'focusout',
    'wheel',
    'scroll',
  ];
  const recordEvent = (event) => {
    if (!operation || operation.seenEvents.has(event)) return;
    operation.seenEvents.add(event);
    const time = performance.now();
    operation.events.push({
      type: event.type,
      time,
      isTrusted: event.isTrusted,
      key: event.key,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      inputType: event.inputType,
      clipboardTypes: event.clipboardData
        ? [...event.clipboardData.types]
        : undefined,
    });
    if (event.isTrusted) {
      operation.startedAt ??= time;
      const promise = frames().then((at) => {
        operation?.paintOpportunities.push(at);
      });
      operation.pending.push(promise);
    }
  };
  globalThis.__crossRecordModel = () => {
    if (operation) operation.modelCommits.push(performance.now());
  };
  const selectionState = (
    paragraphs = [...adapter.dom.querySelectorAll('p')],
  ) => {
    const native = document.getSelection();
    const point = (node, offset) => {
      if (!node || !adapter.dom.contains(node)) return null;
      const element =
        node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      const paragraph = element?.closest('p');
      const block = paragraphs.indexOf(paragraph);
      if (block === -1) return null;
      const prefix = document.createRange();
      prefix.selectNodeContents(paragraph);
      prefix.setEnd(node, offset);
      return {
        block,
        offset: prefix.toString().replaceAll('\uFEFF', '').length,
      };
    };
    return {
      selection: adapter.selection(),
      selectionReadiness: adapter.selectionReadiness?.(),
      focused:
        adapter.dom === document.activeElement ||
        adapter.dom.contains(document.activeElement),
      nativeSelection: {
        anchor: point(native?.anchorNode, native?.anchorOffset),
        focus: point(native?.focusNode, native?.focusOffset),
        text: native?.toString(),
        collapsed: native?.isCollapsed,
        rangeCount: native?.rangeCount,
      },
    };
  };
  const samePoint = (actual, expected) =>
    actual?.block === expected.block && actual?.offset === expected.offset;
  const sameSelection = (actual, expected) =>
    samePoint(actual?.anchor, expected.anchor) &&
    samePoint(actual?.focus, expected.focus);
  const selectionMatches = (state, expected) =>
    state.focused &&
    sameSelection(state.selection, expected) &&
    sameSelection(state.nativeSelection, expected) &&
    state.nativeSelection.collapsed ===
      samePoint(expected.anchor, expected.focus);
  const waitForSelection = async (expected, phase, minimumFrameWaits = 0) => {
    const start = performance.now();
    const initial = selectionState();
    let state = initial;
    let frameWaits = 0;
    const fail = (reason) => {
      throw new Error(
        `${phase}: selection did not converge: ${JSON.stringify({
          reason,
          expected,
          initial,
          actual: state,
          selectionAtArm: operation?.selectionAtArm,
          waitedMs: performance.now() - start,
          frameWaits,
        })}`,
      );
    };
    while (
      frameWaits < minimumFrameWaits ||
      !selectionMatches(state, expected) ||
      (phase === 'Untimed selection setup' &&
        adapter.waitForSelectionIdle &&
        state.selectionReadiness?.ready === false)
    ) {
      const remaining = 1000 - (performance.now() - start);
      if (remaining <= 0) fail('Model, native points, or focus differ');
      let timer;
      const completedFrames = await Promise.race([
        frames().then(() => true),
        new Promise((resolve) => {
          timer = setTimeout(() => resolve(false), remaining);
        }),
      ]);
      clearTimeout(timer);
      state = selectionState();
      if (!completedFrames) fail('Selection settlement frame deadline expired');
      frameWaits++;
    }
    return {
      expected,
      initial,
      settled: state,
      waitedMs: performance.now() - start,
      frameWaits,
    };
  };
  const snapshot = () => {
    const paragraphs = [...adapter.dom.querySelectorAll('p')];
    return {
      lines: adapter.lines(),
      domLines: paragraphs.map((node) =>
        node.textContent.replaceAll('\uFEFF', ''),
      ),
      ...selectionState(paragraphs),
      domNodeCount: adapter.dom.querySelectorAll('*').length + 1,
      counters: adapter.counters(),
      kernelTrace: adapter.kernelTrace?.(),
      scroll: {
        top: adapter.dom.scrollTop,
        outer: document.scrollingElement.scrollTop,
      },
    };
  };
  globalThis.crossEditor = {
    async mount(lines, options = {}) {
      operation = null;
      detach();
      detachDocumentEvents();
      adapter?.destroy();
      const host = document.querySelector('#app');
      host.replaceChildren();
      if (!document.getElementById('cross-editor-blur-target')) {
        const button = document.createElement('button');
        button.id = 'cross-editor-blur-target';
        button.type = 'button';
        button.textContent = 'Focus target';
        button.style.cssText =
          'position:fixed;right:12px;top:12px;z-index:100000';
        document.body.append(button);
      }
      const start = performance.now();
      adapter = await mount(host, lines, options);
      const domReady = performance.now();
      const expected = lines.join('');
      while (adapter.dom.textContent.replaceAll('\uFEFF', '') !== expected) {
        if (performance.now() - start > 30000)
          throw new Error('Full DOM did not match the initial document');
        await frames();
      }
      const complete = performance.now();
      const painted = await frames();
      events.forEach((type) =>
        adapter.dom.addEventListener(type, recordEvent, true),
      );
      const resize = (event) => recordEvent(event);
      const recordSelectionChange = (event) => {
        if (operation && adapter.kernelTrace) {
          operation.selectionEvents.push({
            time: performance.now(),
            isTrusted: event.isTrusted,
            ...selectionState(),
          });
        }
      };
      document.addEventListener('selectionchange', recordSelectionChange, true);
      window.addEventListener('resize', resize);
      detach = () => {
        events.forEach((type) =>
          adapter.dom.removeEventListener(type, recordEvent, true),
        );
        window.removeEventListener('resize', resize);
        document.removeEventListener('selectionchange', recordSelectionChange, true);
      };
      return {
        createToDOMMs: domReady - start,
        nativeSurfaceCompleteMs: complete - start,
        mountToTwoFramesMs: painted - start,
        ...snapshot(),
      };
    },
    async select(block, from, to = from) {
      adapter.select(block, from, to);
      const selectionSetup = await waitForSelection(
        { anchor: { block, offset: from }, focus: { block, offset: to } },
        'Untimed selection setup',
        1,
      );
      return { ...snapshot(), selectionSetup };
    },
    arm({ documentEvents = false } = {}) {
      detachDocumentEvents();
      if (documentEvents) {
        events.forEach((type) =>
          document.addEventListener(type, recordEvent, true),
        );
        detachDocumentEvents = () =>
          events.forEach((type) =>
            document.removeEventListener(type, recordEvent, true),
          );
      }
      const selectionAtArm = selectionState();
      adapter.resetCounters();
      operation = {
        selectionAtArm,
        armedAt: performance.now(),
        seenEvents: new WeakSet(),
        startedAt: null,
        events: [],
        selectionEvents: [],
        modelCommits: [],
        paintOpportunities: [],
        pending: [],
        mutationRecords: 0,
        addedNodes: 0,
        removedNodes: 0,
      };
      const owner = operation;
      const observer = new MutationObserver((records) => {
        owner.mutationRecords += records.length;
        for (const record of records) {
          owner.addedNodes += record.addedNodes.length;
          owner.removedNodes += record.removedNodes.length;
        }
      });
      observer.observe(adapter.dom, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });
      operation.observer = observer;
    },
    async finish(expectedSelection) {
      const current = operation;
      await Promise.all(current.pending);
      await frames();
      const selectionSettlement = expectedSelection
        ? await waitForSelection(expectedSelection, 'Post-input selection')
        : undefined;
      current.observer.disconnect();
      detachDocumentEvents();
      const startedAt = current.startedAt;
      const lastPaint = current.paintOpportunities.at(-1);
      const lastModel = current.modelCommits.at(-1);
      const state = snapshot();
      const snapshotCompletedAt = performance.now();
      const result = {
        inputToModelMs:
          startedAt != null && lastModel != null ? lastModel - startedAt : null,
        eventToFrameOpportunityMs:
          startedAt != null && lastPaint != null ? lastPaint - startedAt : null,
        inputToVerifiedStateMs:
          startedAt != null ? snapshotCompletedAt - startedAt : null,
        snapshotCompletedAt,
        selectionAtArm: current.selectionAtArm,
        selectionSettlement,
        events: current.events,
        selectionEvents: current.selectionEvents,
        modelCommitCount: current.modelCommits.length,
        mutationRecords: current.mutationRecords,
        addedNodes: current.addedNodes,
        removedNodes: current.removedNodes,
        ...state,
      };
      operation = null;
      return result;
    },
    abort() {
      const failureTrace = operation
        ? { events: operation.events, selectionEvents: operation.selectionEvents, kernelTrace: adapter.kernelTrace?.(), selectionAtArm: operation.selectionAtArm }
        : null;
      operation?.observer.disconnect();
      detachDocumentEvents();
      operation = null;
      return failureTrace;
    },
    snapshot,
    async textGeometry(block, offset) {
      const paragraph = adapter.dom.querySelectorAll('p')[block];
      if (!paragraph) throw new Error('Missing pointer target paragraph');
      if (
        paragraph.textContent.replaceAll('\uFEFF', '') !==
        adapter.lines()[block]
      )
        throw new Error('Pointer target DOM text differs from the model');
      paragraph.scrollIntoView({ block: 'center', inline: 'nearest' });
      await frames();
      const whole = document.createRange();
      whole.selectNodeContents(paragraph);
      const visualLines = new Set(
        [...whole.getClientRects()]
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map((rect) => Math.round(rect.top * 2) / 2),
      ).size;
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      let current = 0,
        node;
      while ((node = walker.nextNode())) {
        for (let index = 0; index < node.textContent.length; index++) {
          if (node.textContent[index] === '\uFEFF') continue;
          if (current++ !== offset) continue;
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + 1);
          const rect = range.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0)
            throw new Error('Pointer target has no visible character box');
          const x = rect.left + Math.min(rect.width * 0.2, 1);
          const y = rect.top + rect.height / 2;
          if (!paragraph.contains(document.elementFromPoint(x, y)))
            throw new Error(
              'Pointer target is occluded or outside the viewport',
            );
          return {
            x,
            y,
            visualLines,
            target: { block, offset },
            character: node.textContent[index],
          };
        }
      }
      throw new Error('Pointer target offset exceeds paragraph text');
    },
    documentValue: () => adapter.json(),
    format(block, from, to) {
      const paragraph = adapter.dom.querySelectorAll('p')[block];
      if (!paragraph) throw new Error('Missing format target paragraph');
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      let offset = 0,
        covered = 0,
        renderedBold = true,
        node;
      while ((node = walker.nextNode())) {
        const text = node.textContent.replaceAll('\uFEFF', '');
        const overlap = Math.max(
          0,
          Math.min(offset + text.length, to) - Math.max(offset, from),
        );
        if (overlap) {
          covered += overlap;
          const weight = getComputedStyle(node.parentElement).fontWeight;
          renderedBold &&=
            weight === 'bold' || Number.parseFloat(weight) >= 600;
        }
        offset += text.length;
      }
      return {
        text: paragraph.textContent.replaceAll('\uFEFF', '').slice(from, to),
        modelBold: adapter.bold(block, from, to),
        renderedBold: renderedBold && covered === to - from && covered > 0,
      };
    },
    serialize() {
      const start = performance.now();
      const value = JSON.stringify(adapter.json());
      return {
        durationMs: performance.now() - start,
        bytes: new TextEncoder().encode(value).length,
        lines: adapter.lines(),
      };
    },
    destroy() {
      operation = null;
      detach();
      detachDocumentEvents();
      adapter?.destroy();
      adapter = null;
    },
  };
};

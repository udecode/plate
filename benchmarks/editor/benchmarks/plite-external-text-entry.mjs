import React from 'react';
import { createRoot } from 'react-dom/client';

import { history } from '../../../packages/plitejs/dist/history/index.js';
import {
  defineEditorSchema,
  property,
  schema,
  TextApi,
} from '../../../packages/plitejs/dist/index.js';
import {
  createEditor,
  Editable,
  Plite,
} from '../../../packages/plitejs/dist/react/index.js';

const app = document.getElementById('app');
const projectedTextUnits = 4096;
const frame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => resolve(performance.now()));
  });
const paint = async () => {
  await frame();
  await frame();
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const model = defineEditorSchema('schema:external-text-benchmark', {
  elements: {
    code_block: { content: schema.content.text({ min: 1, max: 1 }) },
  },
  id: 'external-text-benchmark',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.not(schema.content.text()),
  version: 1,
});

let current = null;
let events = {};
globalThis.__PLITE_REACT_RENDER_PROFILER__ = {
  record({ kind, id }) {
    const key = `${kind}:${id ?? ''}`;
    events[key] = (events[key] ?? 0) + 1;
  },
};

const listeners = new Map();
// Preserve each Document receiver when forwarding the instrumented native call.
// eslint-disable-next-line @typescript-eslint/unbound-method
const addListener = Document.prototype.addEventListener;
// eslint-disable-next-line @typescript-eslint/unbound-method
const removeListener = Document.prototype.removeEventListener;
Document.prototype.addEventListener = function addEventListener(
  type,
  listener,
  options
) {
  const capture = typeof options === 'boolean' ? options : !!options?.capture;
  const key = `${type}:${capture}`;
  let bucket = listeners.get(key);
  if (!bucket) listeners.set(key, (bucket = new Set()));
  bucket.add(listener);
  addListener.call(this, type, listener, options);
};
Document.prototype.removeEventListener = function removeEventListener(
  type,
  listener,
  options
) {
  const capture = typeof options === 'boolean' ? options : !!options?.capture;
  listeners.get(`${type}:${capture}`)?.delete(listener);
  removeListener.call(this, type, listener, options);
};
const listenerCount = () =>
  [...listeners.values()].reduce((sum, bucket) => sum + bucket.size, 0);

const fixtureText = (lines, fixture) =>
  Array.from({ length: lines }, (_, index) => {
    const prefix =
      fixture === 'code'
        ? `const value_${String(index).padStart(6, '0')} = 'payload';`
        : `line_${String(index).padStart(6, '0')}_payload`;
    return prefix.padEnd(48, fixture === 'code' ? ';' : 'x').slice(0, 48);
  }).join('\n');

const patchText = (text, changes) => {
  const parts = [];
  let offset = 0;
  for (const change of changes) {
    parts.push(text.slice(offset, change.from), change.insert);
    offset = change.to;
  }
  parts.push(text.slice(offset));
  return parts.join('');
};

const createBoundedAdapter = (records, viewIndex) => ({
  mount({ actions, host, state }) {
    const code = host.ownerDocument.createElement('code');
    code.dataset.benchmarkAdapter = '';
    code.tabIndex = 0;
    code.textContent = state.text.slice(0, projectedTextUnits);
    host.append(code);
    const record = {
      actions,
      adapterCopiedCodeUnits: 0,
      adapterMs: 0,
      code,
      destroyed: 0,
      mirror: state.text,
      patches: 0,
      resets: 0,
      state,
      updates: 0,
      viewIndex,
    };
    records.push(record);
    return {
      destroy() {
        record.destroyed += 1;
        code.remove();
      },
      focus() {
        code.focus({ preventScroll: true });
      },
      update({ changes, state: next }) {
        const started = performance.now();
        record.updates += 1;
        if (changes === null) {
          record.resets += 1;
          record.mirror = next.text;
        } else if (changes.length) {
          record.patches += changes.length;
          record.mirror = patchText(record.mirror, changes);
          record.adapterCopiedCodeUnits += record.mirror.length;
        }
        assert(
          record.mirror === next.text,
          'Adapter patch result differs from canonical text'
        );
        record.state = next;
        const projected = record.mirror.slice(0, projectedTextUnits);
        if (code.textContent !== projected) code.textContent = projected;
        record.adapterMs += performance.now() - started;
      },
    };
  },
});

const readMetrics = () => {
  const editables = [...app.querySelectorAll('[data-plite-editor="true"]')];
  const external = editables.map((element) =>
    element.__pliteBrowserHandle.getExternalTextMetrics()
  );
  const totals = {};
  for (const row of external) {
    for (const [key, value] of Object.entries(row)) {
      totals[key] = (totals[key] ?? 0) + value;
    }
  }
  return {
    ...totals,
    adapterCopiedCodeUnits: current.records.reduce(
      (sum, row) => sum + row.adapterCopiedCodeUnits,
      0
    ),
    adapterMs: current.records.reduce((sum, row) => sum + row.adapterMs, 0),
    commitSubscriptions:
      (events['runtime-time:commit-fence-subscribe'] ?? 0) -
      (events['runtime-time:commit-fence-unsubscribe'] ?? 0),
    decorationSubscriptions:
      (events['runtime-time:decoration-fence-subscribe'] ?? 0) -
      (events['runtime-time:decoration-fence-unsubscribe'] ?? 0),
    documentListeners: listenerCount(),
    reactFenceRenders: events['runtime-time:commit-fence-render'] ?? 0,
    reactElementRenders: Object.entries(events)
      .filter(([key]) => key.startsWith('element:'))
      .reduce((sum, [, value]) => sum + value, 0),
  };
};
const difference = (before, after) =>
  Object.fromEntries(
    Object.keys(after).map((key) => [key, after[key] - (before[key] ?? 0)])
  );

const verify = () => {
  const canonical = current.editor.read.children();
  for (let view = 0; view < current.viewCount; view++) {
    const records = current.records.filter(
      (record) => record.viewIndex === view
    );
    assert(records.length === canonical.length, 'Missing external view');
    for (let block = 0; block < canonical.length; block++) {
      const { text } = canonical[block].children[0];
      assert(records[block].mirror === text, 'Mirror text mismatch');
      assert(
        records[block].state.text === text,
        'Delivered canonical text mismatch'
      );
      assert(
        current.editor.read.text.string([block]) === text,
        'Public text excludes external content'
      );
      assert(
        records[block].code.textContent === text.slice(0, projectedTextUnits),
        'Bounded DOM mismatch'
      );
    }
  }
  if (current.independentEditor) {
    const record = current.records.find(
      (candidate) => candidate.viewIndex === current.viewCount
    );
    assert(
      record?.mirror === current.text && record.state.text === current.text,
      'Independent view changed'
    );
    assert(
      current.independentEditor.read.text.string([0]) === current.text,
      'Independent editor changed'
    );
    assert(record.updates === 0, 'Independent view received an update');
  }
  const selection = current.editor.read.selection();
  if (selection?.anchor.path[0] === selection?.focus.path[0]) {
    for (const record of current.records.filter(
      (candidate) => candidate.state.selection
    )) {
      assert(
        record.state.selection.anchor === selection.anchor.offset &&
          record.state.selection.focus === selection.focus.offset,
        'Directed selection mismatch'
      );
    }
  }
  assert(
    current.records.every((record) => record.resets === 0),
    'Ordinary operation reset an adapter'
  );
};

const clear = () => {
  if (!current) return;
  current.root.unmount();
  assert(
    current.records.every((record) => record.destroyed === 1),
    'Unbalanced adapter lifetime'
  );
  assert(
    (events['runtime-time:commit-fence-subscribe'] ?? 0) ===
      (events['runtime-time:commit-fence-unsubscribe'] ?? 0),
    'Leaked commit fence'
  );
  current = null;
  app.textContent = '';
};

const install = async ({
  blockCount = 1,
  decorationCount = 0,
  decorationShape = 'sparse',
  fixture = 'plain',
  independent = false,
  lineCount,
  viewCount = 1,
}) => {
  clear();
  events = {};
  const text = fixtureText(lineCount, fixture);
  const initialValue = Array.from({ length: blockCount }, () => ({
    type: 'code_block',
    children: [{ ...(fixture === 'marked' ? { bold: true } : {}), text }],
  }));
  const shell = document.createElement('div');
  shell.style.cssText =
    'height:600px;overflow:auto;font:14px/1.35 ui-monospace,monospace';
  app.append(shell);
  const editorStart = performance.now();
  const editor = createEditor({ extensions: [model, history()], initialValue });
  const independentEditor = independent
    ? createEditor({
        extensions: [model, history()],
        initialValue: initialValue.slice(0, 1),
      })
    : null;
  const editorCreateMs = performance.now() - editorStart;
  const records = [];
  const root = createRoot(shell);
  const rows = Array.from({ length: viewCount }, (_, viewIndex) => {
    const adapter = createBoundedAdapter(records, viewIndex);
    return React.createElement(Editable, {
      domStrategy: 'full',
      key: viewIndex,
      spellCheck: false,
      renderElement: ({ attributes, slots }) =>
        React.createElement(
          'pre',
          {
            ...attributes,
            style: { margin: 0, whiteSpace: 'pre-wrap' },
          },
          slots.externalText({ adapter, ariaLabel: 'Bounded test text' })
        ),
    });
  });
  const independentView = independentEditor
    ? React.createElement(
        Plite,
        { editor: independentEditor },
        React.createElement(Editable, {
          domStrategy: 'full',
          spellCheck: false,
          renderElement: ({ attributes, slots }) =>
            React.createElement(
              'pre',
              { ...attributes, style: { margin: 0, whiteSpace: 'pre-wrap' } },
              slots.externalText({
                adapter: createBoundedAdapter(records, viewCount),
                ariaLabel: 'Independent bounded text',
              })
            ),
        })
      )
    : null;
  let refreshDecorations;
  let decorationRevision = 0;
  const decorations = decorationCount
    ? [
        {
          id: 'benchmark-decorations',
          observe: ({ refresh }) => {
            refreshDecorations = refresh;
            return () => {
              refreshDecorations = undefined;
            };
          },
          read: ({ entry: [node, path] }) =>
            TextApi.isText(node) && path[0] === 0
              ? Array.from({ length: decorationCount }, (_, index) => {
                  const start =
                    decorationShape === 'overlapping'
                      ? 0
                      : Math.floor(
                          (index * Math.max(1, node.text.length - 1)) /
                            decorationCount
                        );
                  const end =
                    decorationShape === 'overlapping'
                      ? node.text.length
                      : Math.min(start + 1, node.text.length);
                  return {
                    key: `decoration:${index}`,
                    attributes: {
                      'data-benchmark-decoration': decorationRevision,
                    },
                    range: {
                      anchor: { path, offset: start },
                      focus: { path, offset: end },
                    },
                  };
                })
              : [],
        },
      ]
    : [];
  current = {
    editor,
    independentEditor,
    initialValue,
    records,
    root,
    text,
    viewCount,
  };
  const renderStart = performance.now();
  root.render(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(Plite, { decorations, editor }, rows),
      independentView
    )
  );
  for (let attempt = 0; attempt < 600; attempt++) {
    if (
      records.length === blockCount * viewCount + Number(independent) &&
      app.querySelector('[data-plite-editor]')?.__pliteBrowserHandle
    ) {
      break;
    }
    await frame();
  }
  await paint();
  const renderToPaintMs = performance.now() - renderStart;
  current.refreshDecorations = () => {
    decorationRevision += 1;
    refreshDecorations?.({ nodeKeys: [editor.key([0, 0])] });
  };
  verify();
  const editables = [...app.querySelectorAll('[data-plite-editor="true"]')];
  const domElements = editables.reduce(
    (sum, editable) => sum + editable.querySelectorAll('*').length,
    0
  );
  const pliteTextHosts = app.querySelectorAll(
    '[data-plite-node="text"]'
  ).length;
  const adapterElements = app.querySelectorAll(
    '[data-benchmark-adapter]'
  ).length;
  return {
    adapterElements,
    domElements,
    editorCreateMs,
    endToEndMs: editorCreateMs + renderToPaintMs,
    metrics: readMetrics(),
    pliteTextHosts,
    renderToPaintMs,
    canonicalCodeUnits: text.length * blockCount,
    projectedCodeUnits:
      Math.min(projectedTextUnits, text.length) * blockCount * viewCount,
    decorations: records[0].state.decorations.length,
  };
};

const operation = async (run) => {
  await frame();
  const before = readMetrics();
  const updates = current.records.map((record) => record.updates);
  const version = current.editor.read(
    (state) => state.runtime.snapshot().version
  );
  const started = performance.now();
  run();
  const syncMs = performance.now() - started;
  const actionToFrameMs = (await frame()) - started;
  const metrics = difference(before, readMetrics());
  verify();
  return {
    actionToFrameMs,
    syncMs,
    metrics,
    commitCount:
      current.editor.read((state) => state.runtime.snapshot().version) -
      version,
    affectedViews: current.records.filter(
      (record, index) => record.updates !== updates[index]
    ).length,
    adapterUpdateCount: current.records.reduce(
      (sum, record, index) => sum + record.updates - updates[index],
      0
    ),
  };
};

const edit = (spans = 1) => {
  const origin = current.records[0];
  const changes = Array.from({ length: spans }, (_, index) => {
    const position = Math.floor(
      ((index + 1) * origin.mirror.length) / (spans + 1)
    );
    return { from: position, to: position, insert: '!' };
  });
  const started = performance.now();
  origin.mirror = patchText(origin.mirror, changes);
  origin.adapterCopiedCodeUnits += origin.mirror.length;
  origin.adapterMs += performance.now() - started;
  const selection = { anchor: changes[0].from + 1, focus: changes[0].from + 1 };
  const result = origin.actions.dispatch({
    baseVersion: origin.state.version,
    changes,
    intent: 'paste',
    selection,
  });
  assert(result.status === 'applied', 'Local edit rejected');
};

const exercise = async ({ iterations = 20, spans = 1 }) => {
  const rows = {
    local: [],
    selection: [],
    undo: [],
    redo: [],
    remote: [],
    decoration: [],
  };
  const source = createEditor({
    extensions: [model],
    initialValue: current.initialValue,
  });
  const origin = current.records[0];
  origin.code.focus();
  origin.actions.select({
    baseVersion: origin.state.version,
    selection: { anchor: 0, focus: 0 },
  });
  await paint();
  for (let index = 0; index <= iterations; index++) {
    const packet = {};
    packet.local = await operation(() => edit(spans));
    packet.undo = await operation(() =>
      assert(origin.actions.history('undo'), 'Undo failed')
    );
    packet.redo = await operation(() =>
      assert(origin.actions.history('redo'), 'Redo failed')
    );
    await operation(() =>
      assert(origin.actions.history('undo'), 'Cleanup undo failed')
    );
    packet.selection = await operation(() => {
      const anchor = Math.floor(origin.state.text.length / 2) + (index % 2);
      assert(
        origin.actions.select({
          baseVersion: origin.state.version,
          selection: { anchor, focus: anchor - 1 },
        }).status === 'applied',
        'Selection rejected'
      );
    });
    source.update.text.insert('R', {
      at: { path: [0, 0], offset: Math.floor(current.text.length / 2) },
    });
    const remote = source.read((state) => state.lastCommit().changes);
    packet.remote = await operation(() =>
      current.editor.update({ tags: ['remote'] }, (tx) =>
        tx.changes.apply(remote)
      )
    );
    assert(
      origin.state.text === source.read.text.string([0]),
      'Remote text mismatch'
    );
    source.update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: Math.floor(current.text.length / 2) },
        focus: {
          path: [0, 0],
          offset: Math.floor(current.text.length / 2) + 1,
        },
      },
    });
    const restore = source.read((state) => state.lastCommit().changes);
    await operation(() =>
      current.editor.update({ tags: ['remote'] }, (tx) =>
        tx.changes.apply(restore)
      )
    );
    packet.decoration = await operation(() => current.refreshDecorations());
    if (index > 0) {
      for (const [key, row] of Object.entries(packet)) rows[key].push(row);
    }
  }
  verify();
  return { metrics: readMetrics(), rows };
};

globalThis.__PLITE_EXTERNAL_TEXT_BENCHMARK__ = { clear, exercise, install };
globalThis.__PLITE_EXTERNAL_TEXT_BENCHMARK_READY__ = true;

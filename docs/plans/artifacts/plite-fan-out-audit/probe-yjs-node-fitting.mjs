import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { getActiveYjsController } from '../../../../packages/platejs/src/yjs/core/controller-registry.ts';
import {
  createSeededYjsPeers,
  getYjsTrace,
  paragraph,
  syncConnectedPeers,
} from '../../../../packages/platejs/test/yjs/support/collaboration.ts';
import { writeBenchmarkArtifact } from '../../../../benchmarks/slate-v2/donor/shared/stats.mjs';

const rows = [];
for (const blocks of [100, 1000, 10000]) {
  for (const edits of [1, 30, 120]) {
    for (const path of ['current', 'detached-schema']) {
      const [source, target] = createSeededYjsPeers({
        children: Array.from({ length: blocks }, (_, index) => paragraph('block-' + index)),
        clientIds: ['source', 'target'],
      });
      const controller = getActiveYjsController(target.editor);
      assert.ok(controller);
      if (path === 'detached-schema') {
        controller.editorAdapter.canonicalizeNode = (root, node) => {
          const document = target.editor.read.schema.fitDocument(root === 'main'
            ? { children: [node] }
            : { children: [], roots: { [root]: [node] } });
          const children = root === 'main' ? document.children : document.roots[root];
          assert.equal(children.length, 1);
          return children[0];
        };
      }
      source.editor.update((tx) => {
        for (let index = 0; index < edits; index++) {
          tx.text.insert('!', { at: { path: [index % blocks, 0], offset: 0 } });
        }
      });
      const phases = new Map();
      globalThis.__PLITE_REACT_RENDER_PROFILER__ = {
        acceptsCoreDuration: () => true,
        record(event) {
          if (event.kind !== 'core-time' || !event.id || typeof event.duration !== 'number') return;
          const value = phases.get(event.id) ?? { count: 0, duration: 0 };
          value.count++;
          value.duration += event.duration;
          phases.set(event.id, value);
        },
      };
      const start = performance.now();
      syncConnectedPeers([source, target]);
      const duration = performance.now() - start;
      delete globalThis.__PLITE_REACT_RENDER_PROFILER__;
      assert.deepEqual(target.editor.read.children(), source.editor.read.children());
      const row = { blocks, edits, path, duration, phases: Object.fromEntries(phases), trace: getYjsTrace(target) };
      rows.push(row);
      console.log(JSON.stringify({ blocks, edits, path, duration, detachedTransactions: phases.get('transaction-spec-callback')?.count ?? 0 }));
      source.cleanup();
      target.cleanup();
      source.doc.destroy();
      target.doc.destroy();
    }
  }
}
await writeBenchmarkArtifact('docs/plans/artifacts/plite-fan-out-audit/yjs-node-fitting-probe.json', {
  purpose: 'Disposable causal intervention; one sample per row, not a percentile or release claim',
  rows,
  source: Object.fromEntries([
    'packages/platejs/src/yjs/core/editor-adapter.ts',
    'packages/platejs/src/yjs/core/extension.ts',
    'packages/platejs/src/yjs/core/event-change-bridge.ts',
  ].map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
});

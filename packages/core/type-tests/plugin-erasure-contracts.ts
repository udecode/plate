import { createBaseEditor, createBasePlugin } from '@platejs/core';

const BoundaryLeafPlugin = createBasePlugin({
  api: {
    label: () => 'leaf' as const,
  },
  initialState: {
    count: 2,
  },
  key: 'boundaryLeaf',
  read: () => ({
    isReady: () => true,
  }),
  selectors: {
    doubled: (state) => state.count * 2,
  },
  update: () => ({
    increment: (amount: number) => amount + 1,
  }),
});

const BoundaryOwnerPlugin = createBasePlugin({
  dependencies: [BoundaryLeafPlugin],
  key: 'boundaryOwner',
}).extend(({ editor }) => {
  const api: 'leaf' = editor.api.boundaryLeaf.label();
  const read: boolean = editor.read.boundaryLeaf.isReady();
  const selector: number = editor
    .plugin(BoundaryLeafPlugin)
    .store.get('doubled');

  void api;
  void read;
  void selector;

  return {};
});

const editor = createBaseEditor({ plugins: [BoundaryOwnerPlugin] });
const dependencyKey: 'boundaryLeaf' = BoundaryOwnerPlugin.dependencies[0].key;
const portal = editor.plugin(BoundaryLeafPlugin);
const installed: boolean = portal.installed;
const api: 'leaf' = editor.api.boundaryLeaf.label();
const count: number = portal.store.get('count');
const read: boolean = editor.read.boundaryLeaf.isReady();
const selector: number = portal.store.get('doubled');
const update: number = editor.update.boundaryLeaf.increment(1);

// @ts-expect-error Dependency API members stay exact after runtime erasure.
editor.api.boundaryLeaf.missing();
// @ts-expect-error Dependency read members stay exact after runtime erasure.
editor.read.boundaryLeaf.missing();
// @ts-expect-error Dependency update members stay exact after runtime erasure.
editor.update.boundaryLeaf.missing();
// @ts-expect-error Dependency selector keys stay exact after runtime erasure.
editor.plugin(BoundaryLeafPlugin).store.get('missing');

void api;
void count;
void dependencyKey;
void installed;
void read;
void selector;
void update;

import { useSyncExternalStore } from 'react';
import { act, render } from '@testing-library/react';
import { EditableDOMCommitFence } from '../src/components/editable-dom-commit-fence';
import {
  EditableDOMRuntime,
  findMountedEditableDOMRuntime,
  getMountedEditableDOMRuntime,
} from '../src/editable/editable-dom-runtime';
import {
  EditableDOMRuntimeContext,
  useClaimEditableDOMCommit,
} from '../src/hooks/use-claim-editable-dom-commit';
import { createReactEditor } from '../src/plugin/with-react';

const waitForMutations = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve);
  });

const createExternalStore = () => {
  const listeners = new Set<() => void>();
  let value = 'initial';

  return {
    getSnapshot: () => value,
    set(nextValue: string) {
      value = nextValue;
      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe(listener: () => void) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
};

const ExternalStoreAttribute = ({
  store,
}: {
  store: ReturnType<typeof createExternalStore>;
}) => {
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  useClaimEditableDOMCommit();

  return <div data-external-store-value={value} />;
};

const RuntimeRoot = ({
  runtime,
  store,
}: {
  runtime: EditableDOMRuntime;
  store?: ReturnType<typeof createExternalStore>;
}) => (
  <EditableDOMRuntimeContext.Provider value={runtime}>
    <EditableDOMCommitFence runtime={runtime}>
      <div data-plite-editor ref={(node) => runtime.setRoot(node)}>
        {store ? <ExternalStoreAttribute store={store} /> : null}
      </div>
    </EditableDOMCommitFence>
  </EditableDOMRuntimeContext.Provider>
);

test('the root runtime owns one observer across React commits', () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const observe = vi.spyOn(MutationObserver.prototype, 'observe');
  const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
  const renderTree = (text: string) => (
    <EditableDOMCommitFence runtime={runtime}>
      <div data-plite-editor ref={(node) => runtime.setRoot(node)}>
        {text}
      </div>
    </EditableDOMCommitFence>
  );

  runtime.connect();
  const mounted = render(renderTree('first'));

  expect(observe).toHaveBeenCalledTimes(1);

  mounted.rerender(renderTree('second'));

  expect(disconnect).toHaveBeenCalled();
  expect(observe).toHaveBeenCalledTimes(2);

  mounted.unmount();
  runtime.destroy();

  observe.mockRestore();
  disconnect.mockRestore();
});

test('a nested external-store commit is claimed before later hostile mutations are repaired', async () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const store = createExternalStore();
  const onRepair = vi.fn();

  runtime.updateDOMIntegrityRepairHandler(onRepair);
  runtime.connect();

  const mounted = render(<RuntimeRoot runtime={runtime} store={store} />);
  const root = mounted.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  )!;
  const child = root.firstElementChild!;

  act(() => store.set('updated'));
  await waitForMutations();
  runtime.domPhaseScheduler.flush();

  expect(child.getAttribute('data-external-store-value')).toBe('updated');
  expect(onRepair).not.toHaveBeenCalled();

  child.setAttribute('data-hostile', 'true');
  await waitForMutations();
  runtime.domPhaseScheduler.flush();

  expect(child.hasAttribute('data-hostile')).toBe(false);
  expect(onRepair).toHaveBeenCalledTimes(1);

  mounted.unmount();
  runtime.destroy();
});

test('nested React commit claims stay isolated to their mounted root', async () => {
  const firstRuntime = new EditableDOMRuntime({
    editor: createReactEditor(),
  });
  const secondRuntime = new EditableDOMRuntime({
    editor: createReactEditor(),
  });
  const firstStore = createExternalStore();
  const secondRepair = vi.fn();

  firstRuntime.connect();
  secondRuntime.updateDOMIntegrityRepairHandler(secondRepair);
  secondRuntime.connect();

  const mounted = render(
    <>
      <RuntimeRoot runtime={firstRuntime} store={firstStore} />
      <RuntimeRoot runtime={secondRuntime} />
    </>
  );
  const roots = mounted.container.querySelectorAll<HTMLElement>(
    '[data-plite-editor]'
  );

  roots[1]!.setAttribute('data-hostile', 'true');
  act(() => firstStore.set('updated'));
  await waitForMutations();
  firstRuntime.domPhaseScheduler.flush();
  secondRuntime.domPhaseScheduler.flush();

  expect(
    roots[0]!.firstElementChild?.getAttribute('data-external-store-value')
  ).toBe('updated');
  expect(roots[1]!.hasAttribute('data-hostile')).toBe(false);
  expect(secondRepair).toHaveBeenCalledTimes(1);

  mounted.unmount();
  firstRuntime.destroy();
  secondRuntime.destroy();
});

test('unmounted external-store claimers cannot mask later hostile mutations', async () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const store = createExternalStore();
  const onRepair = vi.fn();

  runtime.updateDOMIntegrityRepairHandler(onRepair);
  runtime.connect();

  const mounted = render(<RuntimeRoot runtime={runtime} store={store} />);

  mounted.rerender(<RuntimeRoot runtime={runtime} />);
  act(() => store.set('detached'));

  const root = mounted.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  )!;

  root.setAttribute('data-hostile', 'true');
  await waitForMutations();
  runtime.domPhaseScheduler.flush();

  expect(root.hasAttribute('data-hostile')).toBe(false);
  expect(onRepair).toHaveBeenCalledTimes(1);

  mounted.unmount();
  runtime.destroy();
});

test('read-only root replacement disconnects the old observer and observes only the remount', async () => {
  const runtime = new EditableDOMRuntime({
    editor: createReactEditor(),
    readOnly: true,
  });
  const onRepair = vi.fn();
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');

  firstRoot.setAttribute('contenteditable', 'false');
  firstRoot.setAttribute('data-plite-editor', 'true');
  secondRoot.setAttribute('contenteditable', 'false');
  secondRoot.setAttribute('data-plite-editor', 'true');
  runtime.updateDOMIntegrityRepairHandler(onRepair);
  expect(runtime.readOnly).toBe(true);
  runtime.connect();
  runtime.setRoot(firstRoot);
  runtime.setRoot(secondRoot);

  firstRoot.setAttribute('data-external', 'ignored');
  await new Promise((resolve) => setTimeout(resolve));
  runtime.domPhaseScheduler.flush();

  expect(onRepair).not.toHaveBeenCalled();

  secondRoot.setAttribute('data-external', 'repair');
  await new Promise((resolve) => setTimeout(resolve));
  runtime.domPhaseScheduler.flush();

  expect(onRepair).toHaveBeenCalledTimes(1);
  expect(secondRoot.hasAttribute('data-external')).toBe(false);

  runtime.destroy();
});

test('interaction routing resolves the deepest mounted root runtime and releases it on teardown', () => {
  const outerEditor = createReactEditor();
  const innerEditor = createReactEditor();
  const outerRuntime = new EditableDOMRuntime({ editor: outerEditor });
  const innerRuntime = new EditableDOMRuntime({ editor: innerEditor });
  const outerRoot = document.createElement('div');
  const innerRoot = document.createElement('div');
  const target = document.createElement('span');

  outerRoot.setAttribute('data-plite-editor', 'true');
  innerRoot.setAttribute('data-plite-editor', 'true');
  innerRoot.append(target);
  outerRoot.append(innerRoot);
  document.body.append(outerRoot);

  outerRuntime.setRoot(outerRoot);
  innerRuntime.setRoot(innerRoot);
  outerRuntime.connect();
  innerRuntime.connect();

  expect(findMountedEditableDOMRuntime(target)).toBe(innerRuntime);
  expect(getMountedEditableDOMRuntime(outerEditor)).toBe(outerRuntime);
  expect(getMountedEditableDOMRuntime(innerEditor)).toBe(innerRuntime);

  innerRuntime.destroy();
  expect(getMountedEditableDOMRuntime(innerEditor)).toBeNull();

  outerRuntime.destroy();
  expect(findMountedEditableDOMRuntime(outerRoot)).toBeNull();
  outerRoot.remove();
});

test('an unmounted runtime never joins editor-wide mounted-root state', () => {
  const editor = createReactEditor();
  const mounted = new EditableDOMRuntime({ editor });
  const abandonedRender = new EditableDOMRuntime({ editor });
  const focus = { path: [0, 0], offset: 0 };

  mounted.connect();
  mounted.setVerticalGoalX(24, focus);

  expect(abandonedRender.readVerticalGoalX(focus)).toBeNull();

  mounted.destroy();
  abandonedRender.destroy();
});

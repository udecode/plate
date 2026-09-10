import React, {
  Component,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { DecorationContext } from '../decoration-context';
import type { EditableDOMRuntime } from '../editable/editable-dom-runtime';
import { subscribeSource } from '../editable/runtime-editor-api';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { recordPliteReactRender } from '../render-profiler';

const subscribeEmpty = () => () => {};
const getEmptyDecorationVersion = () => 0;

const createVersionStore = (initialVersion: number) => {
  let version = initialVersion;

  return {
    getSnapshot: () => version,
    setVersion: (nextVersion: number) => {
      version = nextVersion;
    },
  };
};

// oxlint-disable-next-line react/prefer-function-component -- [P0 React lifecycle] getSnapshotBeforeUpdate has no function-component equivalent.
class EditableDOMCommitFenceComponent extends Component<
  {
    children?: ReactNode;
    runtime: EditableDOMRuntime;
  } & {
    commitVersion: number;
    decorationVersion: number;
  }
> {
  componentDidMount() {
    this.props.runtime.completeReactCommit();
  }

  getSnapshotBeforeUpdate() {
    this.props.runtime.prepareReactCommit();

    return null;
  }

  componentDidUpdate() {
    this.props.runtime.completeReactCommit();
  }

  render() {
    return this.props.children;
  }
}

export const EditableDOMCommitFence = ({
  children,
  runtime,
}: {
  children?: ReactNode;
  runtime: EditableDOMRuntime;
}) => {
  const decorationStore = useContext(DecorationContext);
  useIsomorphicLayoutEffect(() => {
    runtime.externalText.setDecorationStore(decorationStore);
  }, [decorationStore, runtime]);
  const commitVersionStore = useMemo(
    () =>
      createVersionStore(
        runtime.editor.read((state) => state.lastCommit()?.version ?? 0)
      ),
    [runtime]
  );
  const decorationVersionStore = useMemo(
    () => createVersionStore(decorationStore?.getVersion() ?? 0),
    [decorationStore]
  );
  const subscribeCommit = useCallback(
    (listener: () => void) => {
      recordPliteReactRender({
        id: 'commit-fence-subscribe',
        kind: 'runtime-time',
      });
      // The provider's decoration source runs before this view's source fence.
      // Deliver text and its derived ranges as one canonical adapter update.
      const unsubscribe = subscribeSource(
        runtime.editor,
        'commit',
        (_snapshot, commit) => {
          if (!commit) return;
          runtime.externalText.commit(commit);
          const requiresReactCommit = runtime.requiresReactCommit(commit);

          recordPliteReactRender({
            id: requiresReactCommit
              ? 'commit-fence-render'
              : 'commit-fence-skip',
            kind: 'runtime-time',
          });
          if (!requiresReactCommit) return;

          commitVersionStore.setVersion(commit.version);
          listener();
        }
      );
      return () => {
        unsubscribe();
        recordPliteReactRender({
          id: 'commit-fence-unsubscribe',
          kind: 'runtime-time',
        });
      };
    },
    [commitVersionStore, runtime]
  );
  const subscribeDecorations = useCallback(
    (listener: () => void) => {
      if (!decorationStore) return subscribeEmpty();
      recordPliteReactRender({
        id: 'decoration-fence-subscribe',
        kind: 'runtime-time',
      });
      const unsubscribe = decorationStore.subscribe((changedNodeKeys) => {
        runtime.externalText.decorationsChanged(changedNodeKeys);
        const retained = runtime.retainsEveryTextFlowNodeKey(changedNodeKeys);

        recordPliteReactRender({
          id: retained ? 'decoration-fence-skip' : 'decoration-fence-render',
          kind: 'runtime-time',
        });
        if (retained) return;

        decorationVersionStore.setVersion(decorationStore.getVersion());
        listener();
      });
      return () => {
        unsubscribe();
        recordPliteReactRender({
          id: 'decoration-fence-unsubscribe',
          kind: 'runtime-time',
        });
      };
    },
    [decorationStore, decorationVersionStore, runtime]
  );
  const commitVersion = useSyncExternalStore(
    subscribeCommit,
    commitVersionStore.getSnapshot,
    commitVersionStore.getSnapshot
  );
  const decorationVersion = useSyncExternalStore(
    decorationStore ? subscribeDecorations : subscribeEmpty,
    decorationStore
      ? decorationVersionStore.getSnapshot
      : getEmptyDecorationVersion,
    decorationStore
      ? decorationVersionStore.getSnapshot
      : getEmptyDecorationVersion
  );

  return (
    <EditableDOMCommitFenceComponent
      commitVersion={commitVersion}
      decorationVersion={decorationVersion}
      runtime={runtime}
    >
      {children}
    </EditableDOMCommitFenceComponent>
  );
};

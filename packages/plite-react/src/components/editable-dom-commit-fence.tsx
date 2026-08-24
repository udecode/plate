import React, {
  Component,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';

import type { EditableDOMRuntime } from '../editable/editable-dom-runtime';
import { ProjectionContext } from '../projection-context';

type EditableDOMCommitFenceProps = {
  children?: ReactNode;
  runtime: EditableDOMRuntime;
};

type EditableDOMCommitFenceStateProps = EditableDOMCommitFenceProps & {
  commitVersion: number;
  projectionSnapshot: unknown;
};

const EMPTY_PROJECTION_SNAPSHOT = Object.freeze(Object.create(null));
const subscribeEmpty = () => () => {};
const getEmptyProjectionSnapshot = () => EMPTY_PROJECTION_SNAPSHOT;

// oxlint-disable-next-line react/prefer-function-component -- [P0 React lifecycle] getSnapshotBeforeUpdate has no function-component equivalent.
class EditableDOMCommitFenceComponent extends Component<EditableDOMCommitFenceStateProps> {
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
}: EditableDOMCommitFenceProps) => {
  const projectionStore = useContext(ProjectionContext);
  const subscribeCommit = useCallback(
    (listener: () => void) => runtime.editor.subscribeCommit(listener),
    [runtime]
  );
  const getCommitVersion = useCallback(
    () => runtime.editor.read((state) => state.lastCommit()?.version ?? 0),
    [runtime]
  );
  const commitVersion = useSyncExternalStore(
    subscribeCommit,
    getCommitVersion,
    getCommitVersion
  );
  const projectionSnapshot = useSyncExternalStore(
    projectionStore ? projectionStore.subscribe : subscribeEmpty,
    projectionStore ? projectionStore.getSnapshot : getEmptyProjectionSnapshot,
    projectionStore ? projectionStore.getSnapshot : getEmptyProjectionSnapshot
  );

  return (
    <EditableDOMCommitFenceComponent
      commitVersion={commitVersion}
      projectionSnapshot={projectionSnapshot}
      runtime={runtime}
    >
      {children}
    </EditableDOMCommitFenceComponent>
  );
};

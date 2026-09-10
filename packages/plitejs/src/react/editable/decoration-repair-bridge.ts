import { useContext } from 'react';

import { DecorationContext } from '../decoration-context';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import type { EditableRepairRequest } from './mutation-controller';

export const useDecorationDOMRepairBridge = ({
  runtime,
  requestEditableRepair,
}: {
  runtime: EditableDOMRuntime;
  requestEditableRepair: (request: EditableRepairRequest) => void;
}) => {
  const decorationStore = useContext(DecorationContext);

  useIsomorphicLayoutEffect(() => {
    if (!decorationStore) return undefined;

    return decorationStore.subscribe((changedNodeKeys) => {
      if (
        runtime.state.isComposing ||
        runtime.retainsEveryTextFlowNodeKey(changedNodeKeys)
      ) {
        return;
      }

      requestEditableRepair({
        forceRender: true,
        kind: 'force-render',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'decoration-refresh',
          selectionSource: 'model-owned',
        },
      });
    });
  }, [decorationStore, requestEditableRepair, runtime]);
};

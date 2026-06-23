import { useContext } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ProjectionContext } from '../projection-context';
import type { EditableInputController } from './input-state';
import type { EditableRepairRequest } from './mutation-controller';

export const useProjectionDOMRepairBridge = ({
  inputController,
  requestEditableRepair,
}: {
  inputController: EditableInputController;
  requestEditableRepair: (request: EditableRepairRequest) => void;
}) => {
  const projectionStore = useContext(ProjectionContext);

  useIsomorphicLayoutEffect(() => {
    if (!projectionStore?.subscribeProjectionRefresh) {
      return;
    }

    return projectionStore.subscribeProjectionRefresh((result) => {
      if (
        inputController.state.isComposing ||
        !result.requiresDOMSelectionExport
      ) {
        return;
      }

      requestEditableRepair({
        forceRender: true,
        kind: 'force-render',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'projection-refresh',
          selectionSource: 'model-owned',
        },
      });
    });
  }, [inputController, projectionStore, requestEditableRepair]);
};

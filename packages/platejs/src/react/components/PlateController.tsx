import React from 'react';

import {
  createPlateController,
  PlateControllerContext,
  PlateModelContext,
  PlatePickedContext,
  PlateScopeContext,
  underController,
} from '../internal/plate-context';

const pickNothing = () => null;

/**
 * Give controls outside every `EditorRoot` what the `EditorRoot` used last gives
 * its own controls outside its editing areas. Until one is used, that is the
 * first `primary` one with a mounted `EditorContent`.
 */
export function EditorController({ children }: { children: React.ReactNode }) {
  const [controller] = React.useState(createPlateController);
  const picked = React.useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    pickNothing
  );
  return (
    <PlateControllerContext value={controller}>
      <PlatePickedContext value={picked}>
        <PlateModelContext value={null}>
          <PlateScopeContext value={underController}>
            {children}
          </PlateScopeContext>
        </PlateModelContext>
      </PlatePickedContext>
    </PlateControllerContext>
  );
}

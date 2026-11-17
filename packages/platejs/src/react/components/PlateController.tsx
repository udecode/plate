import React from 'react';

import {
  createPlateScope,
  PlateControllerContext,
  PlateModelContext,
  PlateScopeProvider,
} from '../internal/plate-context';

/** Share the mounted editor the user focused or pressed last with controls outside individual Plate providers. */
export function EditorController({ children }: { children: React.ReactNode }) {
  const [scope] = React.useState(createPlateScope);
  return (
    <PlateControllerContext value={scope}>
      <PlateModelContext value={null}>
        <PlateScopeProvider scope={scope}>{children}</PlateScopeProvider>
      </PlateModelContext>
    </PlateControllerContext>
  );
}

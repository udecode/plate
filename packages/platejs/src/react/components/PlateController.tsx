import React from 'react';

import {
  createPlateScope,
  PlateControllerContext,
  PlateModelContext,
  PlateScopeContext,
  useLastUsedViewScope,
} from '../internal/plate-context';

/** Share the mounted editor the user focused or pressed last with controls outside individual Plate providers. */
export function EditorController({ children }: { children: React.ReactNode }) {
  const [scope] = React.useState(createPlateScope);
  const outside = useLastUsedViewScope(scope, null);
  return (
    <PlateControllerContext value={scope}>
      <PlateModelContext value={null}>
        <PlateScopeContext value={outside}>{children}</PlateScopeContext>
      </PlateModelContext>
    </PlateControllerContext>
  );
}

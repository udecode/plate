import React from 'react';

import { createPlateTargetScope } from '../internal/createPlateTargetScope';
import {
  PlateControllerContext,
  PlateModelContext,
  PlateScopeProvider,
  type PlateTarget,
} from '../internal/plate-context';

/** Share the last focused mounted editor with controls outside individual Plate providers. */
export function PlateController({ children }: { children: React.ReactNode }) {
  const [scope] = React.useState(() => createPlateTargetScope<PlateTarget>());
  return (
    <PlateControllerContext value={scope}>
      <PlateModelContext value={null}>
        <PlateScopeProvider scope={scope}>{children}</PlateScopeProvider>
      </PlateModelContext>
    </PlateControllerContext>
  );
}

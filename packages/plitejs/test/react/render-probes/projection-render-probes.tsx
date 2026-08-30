import React, { type ReactNode } from 'react';

import {
  type EditorDecorationSelectorContext,
  useDecorationSelector,
  usePliteProjectionEntries,
} from '../../../src/react';

export const createProjectionRenderProbe = <TLabel extends string>(
  renders: Record<TLabel, number>
) =>
  function ProjectionRenderProbe({
    label,
    nodeKey,
  }: {
    label: TLabel;
    nodeKey: string;
  }) {
    const projections = usePliteProjectionEntries(nodeKey);

    renders[label] += 1;

    return <span data-testid={label}>{projections.length}</span>;
  };

export const createDecorationRenderProbe = <TData,>({
  nodeKey,
  renders,
  selector,
}: {
  nodeKey: string;
  renders: { first: number };
  selector: (context: EditorDecorationSelectorContext<TData>) => ReactNode;
}) =>
  function DecorationRenderProbe() {
    const label = useDecorationSelector(selector, undefined, { nodeKey });

    renders.first += 1;

    return <span data-testid="first-decoration">{label}</span>;
  };

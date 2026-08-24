import type { Path } from '@platejs/plite';
import React, { useEffect } from 'react';

import {
  type ReactEditor,
  type RenderElementProps,
  useElementSelected,
} from '../../src';

type SelectionRecords = {
  collapsed: Record<string, boolean | undefined>;
  intersection: Record<string, boolean | undefined>;
  node: Record<string, boolean | undefined>;
};

export const createSelectionRenderElement = (records: SelectionRecords) =>
  function SelectionRenderElement({
    attributes,
    children,
    element,
  }: RenderElementProps) {
    const selected = useElementSelected();
    const collapsedSelected = useElementSelected({ mode: 'collapsed' });
    const nodeSelected = useElementSelected({ mode: 'node' });
    const id = String((element as { id?: unknown }).id);

    records.intersection[id] = selected;
    records.collapsed[id] = collapsedSelected;
    records.node[id] = nodeSelected;

    return <div {...attributes}>{children}</div>;
  };

export const createSelfRemovingElement = ({
  editor,
  removedIds,
  selectedById,
  unmountedIds,
}: {
  editor: ReactEditor;
  removedIds: Set<string>;
  selectedById: Record<string, boolean | undefined>;
  unmountedIds: Set<string>;
}) =>
  function SelfRemovingElement({
    attributes,
    children,
    element,
  }: RenderElementProps) {
    const selected = useElementSelected();
    const { id } = element as { id: string };

    selectedById[id] = selected;

    useEffect(
      () => () => {
        unmountedIds.add(id);
      },
      [id]
    );

    useEffect(() => {
      if (id !== '2' || !selected || removedIds.has(id)) return;

      removedIds.add(id);
      editor.update((tx) => {
        const path = editor.api.dom.assertPath(element);

        tx.nodes.remove({ at: path });
      });
    }, [element, id, selected]);

    return <div {...attributes}>{children}</div>;
  };

export const createExplicitPathRenderElement = ({
  selectedByHostId,
  watchedPath,
}: {
  selectedByHostId: Record<string, boolean | undefined>;
  watchedPath: Path;
}) =>
  function ExplicitPathRenderElement({
    attributes,
    children,
    element,
  }: RenderElementProps) {
    const selected = useElementSelected({ at: watchedPath });
    const id = String((element as { id?: unknown }).id);

    if (id === '0') selectedByHostId[id] = selected;

    return <div {...attributes}>{children}</div>;
  };

export const createElementSelectedHistoryRenderElement = ({
  history,
  latest,
}: {
  history: Record<string, boolean[] | undefined>;
  latest: Record<string, boolean | undefined>;
}) =>
  function ElementSelectedHistoryRenderElement({
    attributes,
    children,
    element,
  }: RenderElementProps) {
    const selected = useElementSelected();
    const { id } = element as { id: string };

    latest[id] = selected;

    let selectedRenders = history[id];
    if (!selectedRenders) {
      selectedRenders = [];
      history[id] = selectedRenders;
    }
    selectedRenders.push(selected);

    return <div {...attributes}>{children}</div>;
  };

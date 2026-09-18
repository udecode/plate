import type React from 'react';

import type { NodeKey } from '../../../core';
import type { Editor } from '../../editor';
import { composeRefs } from '../../internal/react-helpers';

type SelectionHostState = Readonly<{
  anchorKey: NodeKey | null;
  selectedKeys: readonly NodeKey[];
}>;

type HostBinding = {
  anchor: boolean;
  baseCaretColor: string;
  element: HTMLElement | null;
  key: NodeKey;
  ref: React.RefCallback<HTMLElement>;
  selected: boolean;
  sourceRef: React.Ref<HTMLElement> | undefined;
};

type TableSelectionHostController = {
  bindings: Map<NodeKey, HostBinding>;
  hosts: Map<NodeKey, HostBinding>;
  selectedKeySet: ReadonlySet<NodeKey>;
  state: SelectionHostState;
};

const EMPTY_STATE: SelectionHostState = Object.freeze({
  anchorKey: null,
  selectedKeys: Object.freeze([]),
});
const EDITOR_TO_TABLE_SELECTION_HOST_CONTROLLER = new WeakMap<
  Editor,
  TableSelectionHostController
>();

const getController = (editor: Editor) => {
  const existing = EDITOR_TO_TABLE_SELECTION_HOST_CONTROLLER.get(editor);

  if (existing) return existing;

  const controller: TableSelectionHostController = {
    bindings: new Map(),
    hosts: new Map(),
    selectedKeySet: new Set(),
    state: EMPTY_STATE,
  };

  EDITOR_TO_TABLE_SELECTION_HOST_CONTROLLER.set(editor, controller);

  return controller;
};

const paintHost = (
  binding: HostBinding,
  { anchor, selected }: { anchor: boolean; selected: boolean }
) => {
  const { element } = binding;

  if (!element) return;

  if (binding.selected !== selected) {
    if (selected) {
      element.setAttribute('data-table-cell-selected', 'true');
    } else {
      element.removeAttribute('data-table-cell-selected');
    }
    binding.selected = selected;
  }

  if (binding.anchor === anchor) return;

  if (anchor) {
    binding.baseCaretColor = element.style.caretColor;
    element.style.caretColor = 'transparent';
  } else {
    element.style.caretColor = binding.baseCaretColor;
    binding.baseCaretColor = '';
  }
  binding.anchor = anchor;
};

const detachHost = (
  controller: TableSelectionHostController,
  binding: HostBinding,
  element: HTMLElement
) => {
  if (binding.element !== element) return;

  paintHost(binding, { anchor: false, selected: false });
  binding.element = null;
  if (controller.hosts.get(binding.key) === binding) {
    controller.hosts.delete(binding.key);
  }
  if (controller.bindings.get(binding.key) === binding) {
    controller.bindings.delete(binding.key);
  }
};

export const getTableSelectionCellRef = (
  editor: Editor,
  key: NodeKey,
  sourceRef: React.Ref<HTMLElement> | undefined
): React.RefCallback<HTMLElement> => {
  const controller = getController(editor);
  const existing = controller.bindings.get(key);

  if (existing && existing.sourceRef === sourceRef) return existing.ref;

  const binding: HostBinding = {
    anchor: false,
    baseCaretColor: '',
    element: null,
    key,
    ref: null as unknown as React.RefCallback<HTMLElement>,
    selected: false,
    sourceRef,
  };
  const bindHost: React.RefCallback<HTMLElement> = (element) => {
    if (!element) return;

    binding.element = element;
    controller.bindings.set(key, binding);
    controller.hosts.set(key, binding);
    const selected = controller.selectedKeySet.has(key);

    paintHost(binding, {
      anchor: selected && controller.state.anchorKey === key,
      selected,
    });

    return () => detachHost(controller, binding, element);
  };

  binding.ref = composeRefs(sourceRef, bindHost);
  controller.bindings.set(key, binding);

  return binding.ref;
};

export const updateTableSelectionHostState = (
  editor: Editor,
  state: SelectionHostState
) => {
  const controller = getController(editor);
  const previousKeys = controller.selectedKeySet;
  const nextKeys = new Set(state.selectedKeys);
  const affectedKeys = new Set([...previousKeys, ...nextKeys]);

  if (controller.state.anchorKey) {
    affectedKeys.add(controller.state.anchorKey);
  }
  if (state.anchorKey) affectedKeys.add(state.anchorKey);

  controller.state = state;
  controller.selectedKeySet = nextKeys;

  for (const key of affectedKeys) {
    const binding = controller.hosts.get(key);

    if (!binding) continue;
    const selected = nextKeys.has(key);

    paintHost(binding, {
      anchor: selected && state.anchorKey === key,
      selected,
    });
  }
};

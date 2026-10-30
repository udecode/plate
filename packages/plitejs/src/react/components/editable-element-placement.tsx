import React from 'react';

import type { Path } from '../..';

/** @internal */
export type EditableElementLayout = Readonly<{
  hasTextLines: boolean;
  height: number;
  left: number;
  spillsPastBox: boolean;
  top: number;
  width: number;
}>;

/**
 * The key of a path in a layouts map.
 *
 * @internal
 */
export const pathKey = (path: Path) => path.join('.');

const EditableElementLayoutsContext = React.createContext<ReadonlyMap<
  string,
  EditableElementLayout
> | null>(null);

const holdsAnotherEditorNode = (parent: Element, box: Element) =>
  Array.from(parent.children).some(
    (child) =>
      child !== box &&
      (child.hasAttribute('data-editor-node') ||
        child.querySelector('[data-editor-node]') !== null)
  );

/**
 * The outermost box that holds this element and no other editor node, so a
 * renderer's wrapper moves with its element instead of staying in flow.
 */
export const getElementPlacementBox = (element: HTMLElement) => {
  let box = element;

  for (
    let parent = box.parentElement;
    parent &&
    !parent.hasAttribute('data-editor-node') &&
    !holdsAnotherEditorNode(parent, box);
    parent = box.parentElement
  ) {
    box = parent;
  }

  return box;
};

const PLACED_ATTRIBUTE = 'data-editor-placed';
const PLACED_ELEMENT_ATTRIBUTE = 'data-editor-placed-element';
const PLACED_TEXT_ATTRIBUTE = 'data-editor-placed-text';
const SPILL_ATTRIBUTE = 'data-editor-placed-spill';

const PLACEMENT_VARIABLES = {
  height: '--editor-placed-height',
  left: '--editor-placed-left',
  top: '--editor-placed-top',
  width: '--editor-placed-width',
} as const;

// Registered without inheritance, so a new value restyles only the elements
// placement sets it on.
const PLACEMENT_PROPERTIES = Object.values(PLACEMENT_VARIABLES)
  .map(
    (variable) =>
      `@property ${variable}{syntax:'<length>';inherits:false;initial-value:0px}`
  )
  .join('');

const BOX_POSITION_RULE = `[${PLACED_ATTRIBUTE}]{position:absolute!important;left:var(${PLACEMENT_VARIABLES.left})!important;top:var(${PLACEMENT_VARIABLES.top})!important;width:var(${PLACEMENT_VARIABLES.width})!important;height:var(${PLACEMENT_VARIABLES.height})!important}`;

const BLOCK_MARGIN_RESET_RULE = `[${PLACED_ATTRIBUTE}],[${PLACED_ELEMENT_ATTRIBUTE}]{margin-block:0!important}`;

const NESTED_EDITOR = `[${PLACED_TEXT_ATTRIBUTE}] [data-editor-node="value"]`;
const OUTSIDE_NESTED_EDITOR = `:not(${NESTED_EDITOR},${NESTED_EDITOR} *)`;

const TEXT_LINES_RULE = `[${PLACED_TEXT_ATTRIBUTE}]{padding-block:0!important;min-height:var(${PLACEMENT_VARIABLES.height})!important}`;

const MEASURED_LINES_NEVER_REWRAP_RULE = `[${PLACED_TEXT_ATTRIBUTE}],[${PLACED_TEXT_ATTRIBUTE}] *${OUTSIDE_NESTED_EDITOR}{text-wrap-mode:nowrap!important}`;

const SPILL_RULE = `[${SPILL_ATTRIBUTE}]{overflow:visible!important}`;

// Applies a placement over the box's own styles, so a renderer keeps owning
// them and they come back unchanged when the placement clears.
const ELEMENT_PLACEMENT_RULE = `${PLACEMENT_PROPERTIES}${BOX_POSITION_RULE}${BLOCK_MARGIN_RESET_RULE}${TEXT_LINES_RULE}${MEASURED_LINES_NEVER_REWRAP_RULE}${SPILL_RULE}`;

type Placement = Readonly<{ box: HTMLElement; element: HTMLElement }>;

const boxOwners = new WeakMap<HTMLElement, Placement>();

const placeElement = (placement: Placement, layout: EditableElementLayout) => {
  const { box, element } = placement;

  boxOwners.set(box, placement);
  for (const key of ['height', 'left', 'top', 'width'] as const) {
    box.style.setProperty(PLACEMENT_VARIABLES[key], `${layout[key]}px`);
  }
  box.toggleAttribute(SPILL_ATTRIBUTE, layout.spillsPastBox);
  box.setAttribute(PLACED_ATTRIBUTE, '');
  element.setAttribute(PLACED_ELEMENT_ATTRIBUTE, '');
  element.toggleAttribute(PLACED_TEXT_ATTRIBUTE, layout.hasTextLines);
  element.style.setProperty(PLACEMENT_VARIABLES.height, `${layout.height}px`);
};

const releaseOwnedBox = (placement: Placement) => {
  const { box } = placement;

  if (boxOwners.get(box) !== placement) return;
  boxOwners.delete(box);
  box.removeAttribute(PLACED_ATTRIBUTE);
  box.removeAttribute(SPILL_ATTRIBUTE);
  for (const variable of Object.values(PLACEMENT_VARIABLES)) {
    box.style.removeProperty(variable);
  }
};

const clearPlacement = (placement: Placement) => {
  const { element } = placement;

  element.removeAttribute(PLACED_ELEMENT_ATTRIBUTE);
  element.removeAttribute(PLACED_TEXT_ATTRIBUTE);
  element.style.removeProperty(PLACEMENT_VARIABLES.height);
  releaseOwnedBox(placement);
};

/**
 * Placements by `pathKey` for one editable, with the rule that applies them.
 *
 * @internal
 */
export const EditableElementLayoutsProvider = ({
  children,
  layouts,
}: {
  children: React.ReactNode;
  layouts: ReadonlyMap<string, EditableElementLayout> | null;
}) => (
  <EditableElementLayoutsContext value={layouts}>
    {layouts && (
      <style href="editor-element-placement" precedence="editor">
        {ELEMENT_PLACEMENT_RULE}
      </style>
    )}
    {children}
  </EditableElementLayoutsContext>
);

/**
 * The layout is part of the ref's identity, because React calls a new ref with
 * its element before the renderer's own layout effects. React first calls the
 * old ref with null, so a null call clears in a microtask, after the new ref
 * has kept the box's attributes. Removing `data-editor-placed-text` and adding
 * it back in one commit makes Chrome restyle every element the never-rewrap
 * rule matches.
 */
export const useEditableElementPlacementRef = (
  bindNodeRef: (node: Node | null) => void,
  path: Path | null
): React.RefCallback<HTMLElement> => {
  const layouts = React.useContext(EditableElementLayoutsContext);
  const layout = path ? layouts?.get(pathKey(path)) : undefined;
  const placed = React.useRef<Placement | null>(null);

  return React.useCallback(
    (element: HTMLElement | null) => {
      bindNodeRef(element);
      const previous = placed.current;

      if (!element) {
        if (previous) {
          queueMicrotask(() => {
            if (placed.current !== previous) return;
            clearPlacement(previous);
            placed.current = null;
          });
        }
        return;
      }
      const box = layout ? getElementPlacementBox(element) : null;

      if (previous && (previous.box !== box || previous.element !== element)) {
        clearPlacement(previous);
      }
      placed.current = null;
      if (!box || !layout) return;
      const placement = { box, element };

      placeElement(placement, layout);
      placed.current = placement;
    },
    [bindNodeRef, layout]
  );
};

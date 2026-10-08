import React from 'react';

import type { Path } from '../..';

/** @internal */
export type EditableElementLayout = Readonly<{
  height: number;
  left: number;
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

const PLACEMENT_VARIABLES = {
  height: '--editor-placed-height',
  left: '--editor-placed-left',
  top: '--editor-placed-top',
  width: '--editor-placed-width',
} as const;

// Registered without inheritance, so a new value restyles only the box.
const PLACEMENT_PROPERTIES = Object.values(PLACEMENT_VARIABLES)
  .map(
    (variable) =>
      `@property ${variable}{syntax:'<length>';inherits:false;initial-value:0px}`
  )
  .join('');

// Applies a placement over the box's own styles, so a renderer keeps owning
// them and they come back unchanged when the placement clears.
const ELEMENT_PLACEMENT_RULE = `${PLACEMENT_PROPERTIES}[${PLACED_ATTRIBUTE}]{position:absolute!important;left:var(${PLACEMENT_VARIABLES.left})!important;top:var(${PLACEMENT_VARIABLES.top})!important;width:var(${PLACEMENT_VARIABLES.width})!important;height:var(${PLACEMENT_VARIABLES.height})!important}`;

const placeElement = (box: HTMLElement, layout: EditableElementLayout) => {
  for (const key of ['height', 'left', 'top', 'width'] as const) {
    box.style.setProperty(PLACEMENT_VARIABLES[key], `${layout[key]}px`);
  }
  box.setAttribute(PLACED_ATTRIBUTE, '');
};

const clearPlacement = (box: HTMLElement) => {
  box.removeAttribute(PLACED_ATTRIBUTE);
  for (const variable of Object.values(PLACEMENT_VARIABLES)) {
    box.style.removeProperty(variable);
  }
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
      <style href="plite-element-placement" precedence="plite">
        {ELEMENT_PLACEMENT_RULE}
      </style>
    )}
    {children}
  </EditableElementLayoutsContext>
);

/**
 * The ref changes with the node binding and the layout, so an edit or a reflow
 * calls it again and rebinds the element before the renderer's own layout
 * effects. Each call clears the box the previous call placed, so a detach,
 * which React and a ref merge that forwards it deliver as a call with null,
 * releases the box. A renderer whose ref merge keeps one identity never sees a
 * new layout.
 */
export const useEditableElementPlacementRef = (
  bindNodeRef: (node: Node | null) => void,
  path: Path | null
): React.RefCallback<HTMLElement> => {
  const layouts = React.useContext(EditableElementLayoutsContext);
  const layout = path ? layouts?.get(pathKey(path)) : undefined;
  const placed = React.useRef<HTMLElement | null>(null);

  return React.useCallback(
    (element: HTMLElement | null) => {
      bindNodeRef(element);
      if (placed.current) clearPlacement(placed.current);
      placed.current = null;
      if (!element || !layout) return;
      const box = getElementPlacementBox(element);

      placeElement(box, layout);
      placed.current = box;
    },
    [bindNodeRef, layout]
  );
};

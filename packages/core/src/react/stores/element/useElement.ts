import type { Element, ElementOf } from '@platejs/plite';
import type { EditorSchemaSource } from '@platejs/plite/internal';

import type { PluginReference } from '../../../lib';
import { useElementContext } from './useElementStore';

export type PlateElementDescriptor = EditorSchemaSource & PluginReference;

export type PlateElementForDescriptor<TPlugin extends PlateElementDescriptor> =
  Extract<ElementOf<TPlugin>, Element>;

const getElementScope = (plugin?: PlateElementDescriptor) => plugin?.name;

export function useElement(): Element;
export function useElement<const TPlugin extends PlateElementDescriptor>(
  plugin: TPlugin
): PlateElementForDescriptor<TPlugin>;
/** Get the current element and fail when the requested provider is absent. */
export function useElement(plugin?: PlateElementDescriptor): Element {
  const scope = getElementScope(plugin);
  const value = useElementContext(scope)?.element;

  if (!value) {
    throw new Error(
      `useElement(${
        scope ?? 'nearest'
      }) must be used inside the matching element provider.`
    );
  }

  return value;
}

export function useOptionalElement(): Element | null;
export function useOptionalElement<
  const TPlugin extends PlateElementDescriptor,
>(plugin: TPlugin): PlateElementForDescriptor<TPlugin> | null;
/** Get the current element, or `null` when its provider is absent. */
export function useOptionalElement(
  plugin?: PlateElementDescriptor
): Element | null {
  return useElementContext(getElementScope(plugin))?.element ?? null;
}

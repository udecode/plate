import type { Element, ElementOf, EditorSchemaSource } from '../../../facade';
import type { PluginReference } from '../../../lib';
import { useElementContext } from './useElementStore';

export type PlateElementDescriptor = EditorSchemaSource & PluginReference;

export type PlateElementForDescriptor<TPlugin extends PlateElementDescriptor> =
  Extract<ElementOf<TPlugin>, Element>;

export function useElement(): Element;
export function useElement<const TPlugin extends PlateElementDescriptor>(
  plugin: TPlugin
): PlateElementForDescriptor<TPlugin>;
/** Get the current element and fail when the requested provider is absent. */
export function useElement(plugin?: PlateElementDescriptor): Element {
  const scope = plugin?.name;
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

import type { Element, ElementOf, EditorSchemaSource } from '../../../facade';
import type { PluginReference } from '../../../lib';
import { useElementContext } from './useElementStore';

export type ElementDescriptor = EditorSchemaSource & PluginReference;

export type ElementForDescriptor<TPlugin extends ElementDescriptor> = Extract<
  ElementOf<TPlugin>,
  Element
>;

export function useElement(): Element;
export function useElement<const TPlugin extends ElementDescriptor>(
  plugin: TPlugin
): ElementForDescriptor<TPlugin>;
/** Get the current element and fail when the requested provider is absent. */
export function useElement(plugin?: ElementDescriptor): Element {
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

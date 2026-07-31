import type {
  Element,
  SchemaElementFor,
  SchemaElementTypes,
} from '@platejs/plite';
import type { EditorSchemaSource } from '@platejs/plite/internal';

import type { PlateSchemaSource, PluginReference } from '../../../lib';
import type { InferPluginDocumentType } from '../../../lib/plugin/pluginSchemaModel.internal';
import type { InternalPluginDefinitionOf } from '../../../lib/plugin/pluginDefinitionLookup.internal';

import { useElementContext } from './useElementStore';

export type PlateElementDescriptor = EditorSchemaSource & PluginReference;

export type PlateElementForDescriptor<TPlugin extends PlateElementDescriptor> =
  SchemaElementFor<
    PlateSchemaSource<InternalPluginDefinitionOf<TPlugin>>,
    Extract<
      SchemaElementTypes<
        PlateSchemaSource<InternalPluginDefinitionOf<TPlugin>>
      >,
      InferPluginDocumentType<InternalPluginDefinitionOf<TPlugin>>
    >
  >;

const getElementScope = (plugin?: PlateElementDescriptor) => plugin?.name;

export function useElement<TElement extends Element = Element>(): TElement;
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

export function useOptionalElement<
  TElement extends Element = Element,
>(): TElement | null;
export function useOptionalElement<
  const TPlugin extends PlateElementDescriptor,
>(plugin: TPlugin): PlateElementForDescriptor<TPlugin> | null;
/** Get the current element, or `null` when its provider is absent. */
export function useOptionalElement(
  plugin?: PlateElementDescriptor
): Element | null {
  return useElementContext(getElementScope(plugin))?.element ?? null;
}

import type {
  Editor,
  EditorElementBehavior,
  EditorElementPropertyDescriptor,
  EditorElementSpec,
  EditorSchemaApi,
  Element,
} from '../interfaces';
import {
  getExtensionRegistry,
  registerElementSpec,
} from './extension-registry';

const normalizeElementSpecs = (
  specs: EditorElementSpec | readonly EditorElementSpec[]
) => (Array.isArray(specs) ? specs : [specs]);

const getElementType = (element: { type?: unknown }) =>
  typeof element.type === 'string' ? element.type : null;

const isInlineVoidKind = (kind: EditorElementSpec['void']) =>
  kind === 'inline' || kind === 'markable-inline';

const isVoidKind = (kind: EditorElementSpec['void']) =>
  kind === 'block' ||
  kind === 'editable-island' ||
  kind === 'inline' ||
  kind === 'markable-inline';

const isEditableIslandVoidKind = (kind: EditorElementSpec['void']) =>
  kind === 'editable-island';

const mergeElementSpecs = (
  base: EditorElementSpec,
  overlay: EditorElementSpec
): EditorElementSpec => ({
  ...base,
  ...overlay,
  properties: Object.freeze({
    ...(base.properties ?? {}),
    ...(overlay.properties ?? {}),
  }),
  type: base.type,
});

const getDefaultElementProperty = (
  descriptor: EditorElementPropertyDescriptor | null
) => {
  const defaultValue = descriptor?.default;

  return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
};

const getOwnElementProperty = (element: Element, property: string) => {
  if (!Object.hasOwn(element, property)) {
    return;
  }

  return (element as unknown as Record<string, unknown>)[property];
};

export const createEditorSchema = (
  getEditor: () => Editor<any>
): EditorSchemaApi => {
  const getSpec = (element: { type?: unknown }) => {
    const type = getElementType(element);
    const registry = getExtensionRegistry(getEditor());
    const exactSpec = type
      ? (registry.elementSpecs.get(type)?.spec ?? null)
      : null;

    let spec = exactSpec;

    for (const registration of registry.elementMatchers) {
      if (registration.spec.match?.(element as Element)) {
        spec = spec
          ? mergeElementSpecs(spec, registration.spec)
          : registration.spec;
      }
    }

    return spec;
  };

  const getElementBehavior = (element: Element): EditorElementBehavior => {
    const spec = getSpec(element);
    const voidNode = isVoidKind(spec?.void);
    const inline = spec
      ? spec.inline === true || isInlineVoidKind(spec.void)
      : getElementType(element) === 'link';
    const markableVoid =
      spec?.markableVoid === true || spec?.void === 'markable-inline';
    const editableIsland = isEditableIslandVoidKind(spec?.void);
    const selectable = spec?.selectable !== false;
    const atom = spec?.atom === true || (voidNode && !editableIsland);

    return Object.freeze({
      atom,
      editableIsland,
      inline,
      isolating: spec?.isolating === true,
      keyboardSelectable:
        spec?.keyboardSelectable === true || (selectable && atom),
      markableVoid,
      readOnly: spec?.readOnly === true,
      selectable,
      void: voidNode,
    });
  };

  const getElementPropertyDescriptor = (
    type: string,
    property: string
  ): EditorElementPropertyDescriptor | null =>
    getExtensionRegistry(getEditor()).elementSpecs.get(type)?.spec.properties?.[
      property
    ] ?? null;

  const getResolvedElementPropertyDescriptor = (
    element: Element,
    property: string
  ): EditorElementPropertyDescriptor | null =>
    getSpec(element)?.properties?.[property] ?? null;

  const getElementProperty = <T = unknown>(
    element: Element,
    property: string
  ): T | undefined => {
    const ownValue = getOwnElementProperty(element, property);

    if (ownValue !== undefined) {
      return ownValue as T;
    }

    const type = getElementType(element);

    if (!type) {
      return;
    }

    return getDefaultElementProperty(
      getResolvedElementPropertyDescriptor(element, property)
    ) as T | undefined;
  };

  const getComparableElementProperty = (
    type: string,
    property: string,
    value: unknown
  ) => {
    if (value !== undefined) {
      return value;
    }

    return getDefaultElementProperty(
      getElementPropertyDescriptor(type, property)
    );
  };

  const isElementPropertyEqual = (
    type: string,
    property: string,
    left: unknown,
    right: unknown
  ) => {
    const descriptor = getElementPropertyDescriptor(type, property);
    const leftValue = getComparableElementProperty(type, property, left);
    const rightValue = getComparableElementProperty(type, property, right);

    if (descriptor?.equals) {
      return descriptor.equals(leftValue, rightValue);
    }

    return Object.is(leftValue, rightValue);
  };

  return Object.freeze({
    define: (specs, options) => {
      const cleanups: Array<() => void> = [];
      const cleanupRegisteredSpecs = () => {
        for (const cleanup of cleanups.slice().reverse()) {
          cleanup();
        }
      };

      try {
        for (const spec of normalizeElementSpecs(specs)) {
          cleanups.push(
            registerElementSpec(getEditor(), options?.source ?? 'schema', spec)
          );
        }
      } catch (error) {
        cleanupRegisteredSpecs();
        throw error;
      }

      return cleanupRegisteredSpecs;
    },
    getElementSpec: (type) =>
      getExtensionRegistry(getEditor()).elementSpecs.get(type)?.spec ?? null,
    getElementBehavior,
    getElementProperty,
    getElementPropertyDescriptor,
    isAtom: (element) => getElementBehavior(element).atom,
    isBlock: (element) => !getElementBehavior(element).inline,
    isEditableIsland: (element) => getElementBehavior(element).editableIsland,
    isElementPropertyEqual,
    isInline: (element) => getElementBehavior(element).inline,
    isIsolating: (element) => getElementBehavior(element).isolating,
    isKeyboardSelectable: (element) =>
      getElementBehavior(element).keyboardSelectable,
    isReadOnly: (element) => getElementBehavior(element).readOnly,
    isSelectable: (element) => getElementBehavior(element).selectable,
    isVoid: (element) => getElementBehavior(element).void,
    markableVoid: (element) => getElementBehavior(element).markableVoid,
  });
};

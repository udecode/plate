import type {
  Editor,
  EditorTransformRegistry,
  Value,
} from '../interfaces/editor';

const TRANSFORM_REGISTRIES = new WeakMap<
  Editor,
  EditorTransformRegistry<any>
>();

export const setEditorTransformRegistry = <V extends Value>(
  editor: Editor<V>,
  registry: EditorTransformRegistry<V>
) => {
  TRANSFORM_REGISTRIES.set(editor, registry);
};

export const getEditorTransformRegistry = <V extends Value>(
  editor: Editor<V>
): EditorTransformRegistry<V> => {
  const registry = TRANSFORM_REGISTRIES.get(editor);

  if (!registry) {
    throw new Error('Editor transform registry has not been initialized.');
  }

  return registry as EditorTransformRegistry<V>;
};

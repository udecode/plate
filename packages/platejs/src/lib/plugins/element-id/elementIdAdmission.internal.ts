import {
  type Descendant,
  type EditorDocumentValue,
  type Element,
  ElementApi,
  type Path,
  type RootKey,
  MAIN_ROOT_KEY,
} from '../../../facade';

export type ElementIdLocation = Readonly<{
  path: Path;
  root: RootKey;
}>;

export const assertElementId = (id: unknown, owner: string): string => {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error(`${owner} must be a non-empty string.`);
  }

  return id;
};

export const elementIdRootChildren = (
  value: EditorDocumentValue,
  root: RootKey
): readonly Descendant[] =>
  root === MAIN_ROOT_KEY ? value.children : (value.roots?.[root] ?? []);

export const elementIdDocumentRoots = (
  value: EditorDocumentValue
): readonly RootKey[] => [MAIN_ROOT_KEY, ...Object.keys(value.roots ?? {})];

export const assertElementIds = (value: EditorDocumentValue): void => {
  const locations = new Map<string, ElementIdLocation>();

  for (const root of elementIdDocumentRoots(value)) {
    const visit = (node: Descendant, path: Path) => {
      if (!ElementApi.isElement(node)) return;
      const rawId = node.id;

      if (rawId !== undefined) {
        const id = assertElementId(rawId, `Element ID at ${root}:[${path}]`);
        const existing = locations.get(id);

        if (existing) {
          throw new Error(
            `Duplicate element ID "${id}" at ${existing.root}:[${existing.path}] and ${root}:[${path}].`
          );
        }
        locations.set(id, { path, root });
      }
      node.children.forEach((child, index) => {
        visit(child, [...path, index]);
      });
    };

    elementIdRootChildren(value, root).forEach((node, index) => {
      visit(node, [index]);
    });
  }
};

export type ElementIdTargetContext = ElementIdLocation &
  Readonly<{ ancestors: readonly string[] }>;

export type ElementIdTargetMatcher = (
  element: Element,
  context: ElementIdTargetContext
) => boolean;

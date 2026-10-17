import {
  type EditorStateView,
  type Path,
  type Point,
  ElementApi,
  TextApi,
} from '../../../../core';

export function getFootnoteTarget(
  state: Pick<EditorStateView, 'nodes' | 'points'>,
  path: Path | undefined,
  kind: 'definition' | 'reference'
): { point: Point; targetPath: Path } | undefined {
  if (!path) return undefined;

  let point: Point | undefined;

  if (kind === 'definition') {
    point = state.points.start(path);
  } else {
    const parentEntry = state.nodes.parent(path, {
      match: ElementApi.isElement,
    });

    if (parentEntry) {
      const [parent, parentPath] = parentEntry;
      const childIndex = path.at(-1) ?? -1;
      const nextSibling = parent.children[childIndex + 1];
      const previousSibling = parent.children[childIndex - 1];

      if (TextApi.isText(nextSibling)) {
        point = {
          offset: 0,
          path: parentPath.concat([childIndex + 1]),
        };
      } else if (TextApi.isText(previousSibling)) {
        point = {
          offset: previousSibling.text.length,
          path: parentPath.concat([childIndex - 1]),
        };
      }
    }

    point ??= state.points.start(path.concat([0]));
  }

  return point ? { point, targetPath: path } : undefined;
}

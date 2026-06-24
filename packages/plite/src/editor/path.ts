import {
  type EditorStaticApi,
  LocationApi,
  NodeApi,
  PathApi,
  RangeApi,
} from '../interfaces';

export const path: EditorStaticApi['path'] = (editor, at, options = {}) => {
  const { depth, edge } = options;
  let resolvedAt = at;

  if (LocationApi.isPath(resolvedAt)) {
    if (edge === 'start') {
      const [, firstPath] = NodeApi.first(editor, resolvedAt);
      resolvedAt = firstPath;
    } else if (edge === 'end') {
      const [, lastPath] = NodeApi.last(editor, resolvedAt);
      resolvedAt = lastPath;
    }
  }

  if (LocationApi.isRange(resolvedAt)) {
    if (edge === 'start') {
      resolvedAt = RangeApi.start(resolvedAt);
    } else if (edge === 'end') {
      resolvedAt = RangeApi.end(resolvedAt);
    } else {
      resolvedAt = PathApi.common(
        resolvedAt.anchor.path,
        resolvedAt.focus.path
      );
    }
  }

  if (LocationApi.isPoint(resolvedAt)) {
    resolvedAt = resolvedAt.path;
  }

  if (depth != null) {
    resolvedAt = resolvedAt.slice(0, depth);
  }

  return resolvedAt;
};

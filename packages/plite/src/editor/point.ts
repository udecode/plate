import { LocationApi } from '../interfaces';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';

export const point: EditorStaticApi['point'] = (editor, at, options = {}) => {
  const { edge = 'start' } = options;

  if (LocationApi.isPath(at)) {
    let path: Path;

    if (edge === 'end') {
      const [, lastPath] = NodeApi.last(editor, at);
      path = lastPath;
    } else {
      const [, firstPath] = NodeApi.first(editor, at);
      path = firstPath;
    }

    const node = NodeApi.get(editor, path);

    if (!NodeApi.isText(node)) {
      throw new Error(
        `Cannot get the ${edge} point in the node at path [${at}] because it has no ${edge} text node.`
      );
    }

    return { path, offset: edge === 'end' ? node.text.length : 0 };
  }

  if (LocationApi.isRange(at)) {
    const [start, end] = RangeApi.edges(at);
    return edge === 'start' ? start : end;
  }

  return at;
};

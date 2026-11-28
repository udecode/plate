import type { AnyEditor } from '../interfaces/editor';
import type { Range } from '../interfaces/range';
import { RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { getLocationRoot } from '../internal/root-location';
import { resolveDeletedRange } from '../transforms-text';
import { readWholeBlockLanding, tripleClickedBlock } from './editor-commands';
import { getEditorUpdateRoot, withEditorRootChildren } from './public-state';
import { readLastCommitAnnotation } from './transaction-values';

export const resolveFragmentDeletedRange = (
  editor: AnyEditor,
  range: Range
): NodeSelection | Range | null => {
  const explicitRoot = getLocationRoot(range);
  const targetRoot = explicitRoot ?? getEditorUpdateRoot(editor);
  const landing = editor.read((state) =>
    readWholeBlockLanding(state, range, {
      root: targetRoot,
      tripleClicked: readLastCommitAnnotation(state, tripleClickedBlock, range),
    })
  );

  if (!landing) return resolveDeletedRange(editor, range);
  if (landing.keeps === 'default') {
    const [first, ...rest] = landing.blocks.map(([, path]) => path);
    const firstPath = getDefined(first);

    return landing.whole && firstPath.length === 1
      ? SelectionApi.nodes([firstPath, ...rest], {
          mode: 'block',
          ...(explicitRoot ? { root: explicitRoot } : {}),
        })
      : null;
  }
  if (landing.keeps !== 'first') return range;

  const { blocks, spansLines, text } = landing;
  const [, firstPath] = getDefined(blocks[0]);

  if (blocks.length > 1) {
    const [, lastPath] = getDefined(blocks.at(-1));
    const endPoint = getDefined(
      withEditorRootChildren(editor, targetRoot, () =>
        editor.read((state) => state.points.end(lastPath))
      )
    );

    return {
      anchor: RangeApi.start(range),
      focus: explicitRoot ? { ...endPoint, root: explicitRoot } : endPoint,
    };
  }
  if (RangeApi.isCollapsed(text)) return text;

  return spansLines && firstPath.length === 1 && !RangeApi.equals(text, range)
    ? null
    : resolveDeletedRange(editor, text);
};

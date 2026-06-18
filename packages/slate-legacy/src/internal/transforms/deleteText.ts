import {
  type DeleteTextOptions,
  type Editor,
  ElementApi,
  type NodeEntry,
  type Path,
  PathApi,
  PointApi,
  RangeApi,
} from '../../interfaces';
import { getAt } from '../../utils';

const THAI_SCRIPT_REGEX = /[\u0E00-\u0E7F]+/;

export const deleteText = <E extends Editor>(
  editor: E,
  options: DeleteTextOptions = {}
) => {
  // deleteTextBase(editor as any, {
  //   ...options,
  //   at: getAt(editor, options?.at),
  // });

  let at: any = getAt(editor, options?.at) ?? editor.selection;

  editor.tf.withoutNormalizing(() => {
    const {
      distance = 1,
      reverse = false,
      unit = 'character',
      voids = false,
    } = options;
    let { hanging = false } = options;

    if (!at) {
      return;
    }

    let isCollapsed = false;
    if (RangeApi.isRange(at) && RangeApi.isCollapsed(at)) {
      isCollapsed = true;
      at = at.anchor;
    }

    if (PointApi.isPoint(at)) {
      const furthestVoid = editor.api.void({ at, mode: 'highest' });

      if (!voids && furthestVoid) {
        const [, voidPath] = furthestVoid;
        at = voidPath;
      } else {
        const opts = { distance, unit };
        const target = reverse
          ? editor.api.before(at, opts) || editor.api.start([])
          : editor.api.after(at, opts) || editor.api.end([]);
        at = { anchor: at, focus: target };
        hanging = true;
      }
    }

    if (PathApi.isPath(at)) {
      editor.tf.removeNodes({ at, voids });
      return;
    }

    if (RangeApi.isCollapsed(at)) {
      return;
    }

    if (!hanging) {
      const [, end] = RangeApi.edges(at);
      const endOfDoc = editor.api.end([])!;

      if (!PointApi.equals(end, endOfDoc)) {
        at = editor.api.unhangRange(at, { voids });
      }
    }

    let [start, end] = RangeApi.edges(at);
    const startBlock = editor.api.above({
      at: start,
      voids,
      match: (n) => ElementApi.isElement(n) && editor.api.isBlock(n),
    });
    const endBlock = editor.api.above({
      at: end,
      voids,
      match: (n) => ElementApi.isElement(n) && editor.api.isBlock(n),
    });
    const isAcrossBlocks =
      startBlock && endBlock && !PathApi.equals(startBlock[1], endBlock[1]);
    const isSingleText = PathApi.equals(start.path, end.path);
    const startNonEditable = voids
      ? null
      : (editor.api.void({ at: start, mode: 'highest' }) ??
        editor.api.elementReadOnly({ at: start, mode: 'highest' }));
    const endNonEditable = voids
      ? null
      : (editor.api.void({ at: end, mode: 'highest' }) ??
        editor.api.elementReadOnly({ at: end, mode: 'highest' }));

    // If the start or end points are inside an inline void, nudge them out.
    if (startNonEditable) {
      const before = editor.api.before(start);

      if (
        before &&
        startBlock &&
        PathApi.isAncestor(startBlock[1], before.path)
      ) {
        start = before;
      }
    }

    if (endNonEditable) {
      const after = editor.api.after(end);

      if (after && endBlock && PathApi.isAncestor(endBlock[1], after.path)) {
        end = after;
      }
    }

    // Get the highest nodes that are completely inside the range, as well as
    // the start and end nodes.
    const matches: NodeEntry[] = [];
    let lastPath: Path | undefined;

    for (const entry of editor.api.nodes({ at, voids })) {
      const [node, path] = entry;

      if (lastPath && PathApi.compare(path, lastPath) === 0) {
        continue;
      }

      if (
        (!voids &&
          ElementApi.isElement(node) &&
          // !PATCH: DO NOT remove void blocks
          // (editor.api.isVoid(node) ||
          editor.api.isElementReadOnly(node)) ||
        (!PathApi.isCommon(path, start.path) &&
          !PathApi.isCommon(path, end.path))
      ) {
        matches.push(entry);
        lastPath = path;
      }
    }

    const pathRefs = Array.from(matches, ([, p]) => editor.api.pathRef(p));
    const startRef = editor.api.pointRef(start);
    const endRef = editor.api.pointRef(end);

    let removedText = '';

    if (!isSingleText && !startNonEditable) {
      const point = startRef.current!;
      const [node] = editor.api.leaf(point)!;
      const { path } = point;
      const { offset } = start;
      const text = node.text.slice(offset);
      if (text.length > 0) {
        editor.tf.apply({ offset, path, text, type: 'remove_text' });
        removedText = text;
      }
    }

    const paths = pathRefs
      .reverse()
      .map((r) => r.unref())
      .filter((r): r is Path => r !== null);

    for (const p of paths) {
      editor.tf.removeNodes({ at: p, voids });
    }

    if (!endNonEditable) {
      const point = endRef.current!;
      const [node] = editor.api.leaf(point)!;
      const { path } = point;
      const offset = isSingleText ? start.offset : 0;
      const text = node.text.slice(offset, end.offset);
      if (text.length > 0) {
        editor.tf.apply({ offset, path, text, type: 'remove_text' });
        removedText = text;
      }
    }

    if (!isSingleText && isAcrossBlocks && endRef.current && startRef.current) {
      editor.tf.mergeNodes({
        at: endRef.current,
        hanging: true,
        reverse: !reverse,
        voids,
      });
    }

    // For Thai script, deleting N character(s) backward should delete
    // N code point(s) instead of an entire grapheme cluster.
    // Therefore, the remaining code points should be inserted back.
    if (
      isCollapsed &&
      reverse &&
      unit === 'character' &&
      removedText.length > 1 &&
      THAI_SCRIPT_REGEX.exec(removedText)
    ) {
      editor.tf.insertText(removedText.slice(0, removedText.length - distance));
    }

    const startUnref = startRef.unref();
    const endUnref = endRef.unref();
    const point = reverse ? startUnref || endUnref : endUnref || startUnref;

    if (options?.at == null && point) {
      editor.tf.select(point);
    }
  });
};

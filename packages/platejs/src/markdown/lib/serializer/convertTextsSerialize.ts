import type { Text } from '../../../core';
import { getMarkdownMarkWriter } from '../internal/markdownMappings';
import type { MdRootContent } from '../mdast';
import type { MdMark, SerializeMdContext } from '../types';

export const convertTextsSerialize = (
  slateTexts: readonly Text[],
  options: SerializeMdContext
): MdMark[] => {
  const { mappings } = options;
  const plainMarkSet = new Set(options.plainMarks);
  // A mark is written when a writer represents its value on that leaf.
  const isWritten = (leaf: Text | undefined, key: string) =>
    !!leaf?.[key] &&
    !plainMarkSet.has(key) &&
    getMarkdownMarkWriter(mappings, key, leaf[key]) !== undefined;

  const writerKind = (leaf: Text | undefined, key: string) =>
    leaf && getMarkdownMarkWriter(mappings, key, leaf[key])?.kind;

  const mdastTexts: MdMark[] = [];

  const starts: string[] = [];
  let ends: string[] = [];

  let textTemp = '';
  for (let j = 0; j < slateTexts.length; j++) {
    const cur = slateTexts[j];

    Object.entries(cur).forEach(([key, value]) => {
      if (
        key === 'text' ||
        !value ||
        plainMarkSet.has(key) ||
        isWritten(cur, key) ||
        options.state.schema.property({ key, placement: 'text' })?.role ===
          'metadata'
      ) {
        return;
      }

      // Markdown keeps the text; only the formatting is lost.
      options.report({
        code: 'markdown-property-omitted',
        key,
        message: `Markdown cannot represent text property "${key}"; it was omitted.`,
        model: { ...options.modelLocation(cur), property: key },
        owner: key,
        phase: 'serialize',
        reason: 'unsupported',
        severity: 'warning',
      });
    });
    textTemp += cur.text;

    const prevStarts = starts.slice();
    const prevEnds = ends.slice();

    const prev = slateTexts[j - 1];
    const next = slateTexts[j + 1];
    ends = [];
    mappings.markOrder.forEach((key) => {
      if (isWritten(cur, key)) {
        if (!isWritten(prev, key)) {
          starts.push(key);
        }
        if (!isWritten(next, key)) {
          ends.push(key);
        }
      }
    });

    const endSet = new Set(ends);
    const endsToRemove = starts.reduce<Array<{ index: number; key: string }>>(
      (acc, key, markIndex) => {
        if (endSet.has(key)) {
          acc.push({ index: markIndex, key });
        }
        return acc;
      },
      []
    );

    if (starts.length > 0) {
      let bef = '';
      let aft = '';
      if (
        endsToRemove.length === 1 &&
        (prevStarts.toString() !== starts.toString() ||
          // https://github.com/inokawa/remark-slate-transformer/issues/90
          (prevEnds.some((key) => writerKind(prev, key) === 'emphasis') &&
            ends.some((key) => writerKind(cur, key) === 'strong'))) &&
        starts.length - endsToRemove.length === 0
      ) {
        while (textTemp.startsWith(' ')) {
          bef += ' ';
          textTemp = textTemp.slice(1);
        }
        while (textTemp.endsWith(' ')) {
          aft += ' ';
          textTemp = textTemp.slice(0, -1);
        }
      }
      let res: MdMark = {
        type: 'text',
        value: textTemp,
      };
      textTemp = '';
      starts
        .slice()
        .reverse()
        .forEach((key) => {
          const writer = getMarkdownMarkWriter(mappings, key, cur[key]);

          switch (writer?.kind) {
            case 'delete':
            case 'emphasis':
            case 'strong': {
              res = { children: [res], type: writer.kind };
              break;
            }
            case 'inlineCode': {
              let currentRes = res;
              while (
                currentRes.type !== 'text' &&
                currentRes.type !== 'inlineCode'
              ) {
                currentRes = currentRes.children[0] as MdMark;
              }
              currentRes.type = 'inlineCode';

              break;
            }
            case 'wrap': {
              const node = writer.wrap?.(cur, options);

              if (node && isMdMarkContainer(node)) {
                res = { ...node, children: [res] };
              }
              break;
            }
            // A mark without a writer was reported where it was read.
            case undefined: {
              break;
            }
          }
        });
      const arr: MdMark[] = [];
      if (bef.length > 0) {
        arr.push({ type: 'text', value: bef });
      }
      arr.push(res);
      if (aft.length > 0) {
        arr.push({ type: 'text', value: aft });
      }
      mdastTexts.push(...arr);
    }

    if (endsToRemove.length > 0) {
      endsToRemove.reverse().forEach((e) => {
        starts.splice(e.index, 1);
      });
    } else {
      mdastTexts.push({ type: 'text', value: textTemp });
      textTemp = '';
    }
  }
  if (textTemp) {
    mdastTexts.push({ type: 'text', value: textTemp });
    textTemp = '';
  }

  const mergedTexts = mergeTexts(mdastTexts);

  const flattenedEmptyNodes: MdMark[] = mergedTexts.map((node) => {
    if (!hasContent(node)) {
      return { type: 'text', value: '' };
    }
    return node;
  });

  return flattenedEmptyNodes;
};

const isMdMarkContainer = (
  node: MdRootContent
): node is Exclude<MdMark, { type: 'inlineCode' | 'text' }> =>
  node.type === 'delete' ||
  node.type === 'emphasis' ||
  node.type === 'mdxJsxTextElement' ||
  node.type === 'strong';

const hasContent = (node: MdMark): boolean => {
  if (node.type === 'inlineCode') {
    // inline has no children - no deeper search needed
    return node.value !== '';
  }

  if (node.type === 'text') {
    // inline has no children - no deeper search needed
    return node.value !== '';
  }

  if (node.children?.length > 0) {
    for (const child of node.children) {
      // all types other then emphasis are represented with some characters that can also be formatted
      if (
        child.type !== 'emphasis' &&
        child.type !== 'strong' &&
        child.type !== 'inlineCode' &&
        child.type !== 'delete' &&
        child.type !== 'text'
      ) {
        return true;
      }
      if (hasContent(child)) {
        return true;
      }
    }
  }
  return false;
};

// Adjacent formatting merges only when the containers are equivalent: a red
// span next to a blue span stays two spans.
const sameContainer = (left: MdMark, right: MdMark) =>
  left.type === right.type &&
  (left.type !== 'mdxJsxTextElement' ||
    (left.name === (right as typeof left).name &&
      JSON.stringify(left.attributes) ===
        JSON.stringify((right as typeof left).attributes)));

const mergeTexts = (nodes: MdMark[]): MdMark[] => {
  const res: MdMark[] = [];
  for (const cur of nodes) {
    const last = res.at(-1);
    if (last && sameContainer(last, cur)) {
      if (last.type === 'text') {
        last.value += (cur as typeof last).value;
      } else if (last.type === 'inlineCode') {
        last.value += (cur as typeof last).value;
      } else {
        last.children = mergeTexts(
          last.children.concat((cur as typeof last).children) as MdMark[]
        );
      }
    } else {
      if (cur.type === 'text' && cur.value === '') continue;
      res.push(cur);
    }
  }
  return res;
};

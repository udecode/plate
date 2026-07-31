import type { Text } from '@platejs/plite';

import type { MdMark, SerializeMdContext } from '../types';
import type { MdRootContent } from '../mdast';

// inlineCode should be last because of the spec in mdast
// https://github.com/inokawa/remark-slate-transformer/issues/145
export const basicMarkdownMarks = ['italic', 'bold', 'strikethrough', 'code'];

export const convertTextsSerialize = (
  slateTexts: readonly Text[],
  options: SerializeMdContext,
  _pluginName?: string
): MdMark[] => {
  const customLeaf = options.rules
    ? Object.entries(options.rules)
        .filter(([, parser]) => parser?.mark)
        .map(([pluginName]) => pluginName)
    : [];

  const mdastTexts: MdMark[] = [];

  const starts: string[] = [];
  let ends: string[] = [];

  let textTemp = '';
  for (let j = 0; j < slateTexts.length; j++) {
    const cur = slateTexts[j]!;
    textTemp += cur.text;

    const prevStarts = starts.slice();
    const prevEnds = ends.slice();

    const prev = slateTexts[j - 1];
    const next = slateTexts[j + 1];
    ends = [];
    (
      [
        ...basicMarkdownMarks,
        // exclude repeated marks
        ...customLeaf.filter((k) => !basicMarkdownMarks.includes(k)),
      ] as const
    ).forEach((pluginName) => {
      const nodeType = options.registry.getType(pluginName);

      if (cur[nodeType]) {
        // Skip marks that should be treated as plain text
        if (options.plainMarks?.includes(pluginName)) {
          return;
        }

        if (!prev?.[nodeType]) {
          starts.push(pluginName);
        }
        if (!next?.[nodeType]) {
          ends.push(pluginName);
        }
      }
    });

    const endsToRemove = starts.reduce<{ index: number; pluginName: string }[]>(
      (acc, pluginName, pluginIndex) => {
        if (ends.includes(pluginName)) {
          acc.push({ index: pluginIndex, pluginName });
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
          (prevEnds.includes('italic') && ends.includes('bold'))) &&
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
        .forEach((pluginName) => {
          const nodeParser = options.rules?.[pluginName]?.serialize;

          if (nodeParser) {
            const node = nodeParser(cur, options);

            if (isMdMarkContainer(node)) {
              res = {
                ...node,
                children: [res],
              };
            }
          }

          switch (pluginName) {
            case 'bold': {
              res = {
                children: [res],
                type: 'strong',
              };
              break;
            }
            case 'code': {
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
            case 'italic': {
              res = {
                children: [res],
                type: 'emphasis',
              };
              break;
            }
            case 'strikethrough': {
              res = {
                children: [res],
                type: 'delete',
              };
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

  const flattenedEmptyNodes = mergedTexts.map((node) => {
    if (!hasContent(node)) {
      return { type: 'text', value: '' } as MdMark;
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

const mergeTexts = (nodes: MdMark[]): MdMark[] => {
  const res: MdMark[] = [];
  for (const cur of nodes) {
    const last = res.at(-1);
    if (last && last.type === cur.type) {
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

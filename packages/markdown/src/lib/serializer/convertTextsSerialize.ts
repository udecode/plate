import type { TText } from '@udecode/plate';

import type { astMarks } from '../types';
import type { SerializeMdOptions } from './serializeMd';

import { getCustomMark, unreachable } from './utils';
import { getSerializerByKey } from './utils/getSerializerByKey';

// inlineCode should be last because of the spec in mdast
// https://github.com/inokawa/remark-slate-transformer/issues/145
export const basicMarkdownMarks = ['italic', 'bold', 'strikethrough', 'code'];

export const convertTextsSerialize = (
  slateTexts: readonly TText[],
  options: SerializeMdOptions,
  key?: string
): astMarks[] => {
  const customLeaf: string[] = getCustomMark(options);

  const mdastTexts: astMarks[] = [];

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
    ).forEach((k) => {
      if (cur[k]) {
        if (!prev?.[k]) {
          starts.push(k);
        }
        if (!next?.[k]) {
          ends.push(k);
        }
      }
    });

    const endsToRemove = starts.reduce<{ key: string; index: number }[]>(
      (acc, k, kIndex) => {
        if (ends.includes(k)) {
          acc.push({ key: k, index: kIndex });
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
      let res: astMarks = {
        type: 'text',
        value: textTemp,
      };
      textTemp = '';
      starts
        .slice()
        .reverse()
        .forEach((k) => {
          const nodeParser = getSerializerByKey(k, options);

          if (nodeParser) {
            const node = nodeParser(cur, options) as any;
            res = {
              ...node,
              children: [res],
            };
          }

          switch (k) {
            case 'bold': {
              res = {
                children: [res],
                type: 'strong',
              };
              break;
            }
            case 'code': {
              res = {
                type: 'inlineCode',
                value: (res as any).value,
              };
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

            default: {
              unreachable(k);
              break;
            }
          }
        });
      const arr: astMarks[] = [];
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

  return mergeTexts(mdastTexts);
};

const mergeTexts = (nodes: astMarks[]): astMarks[] => {
  const res: astMarks[] = [];
  for (const cur of nodes) {
    const last = res.at(-1);
    if (last && last.type === cur.type) {
      if (last.type === 'text') {
        last.value += (cur as typeof last).value;
      } else if (last.type === 'inlineCode') {
        last.value += (cur as typeof last).value;
      } else {
        last.children = mergeTexts(
          last.children.concat((cur as typeof last).children) as astMarks[]
        );
      }
    } else {
      if (cur.type === 'text' && cur.value === '') continue;
      res.push(cur);
    }
  }
  return res;
};

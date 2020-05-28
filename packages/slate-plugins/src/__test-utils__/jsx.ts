import { createText } from '__test-utils__/hyperscript/creators';
import { ACTION_ITEM } from 'elements/action-item';
import { BLOCKQUOTE } from 'elements/blockquote';
import { CODE_BLOCK } from 'elements/code-block';
import { HeadingType } from 'elements/heading';
import { IMAGE } from 'elements/image';
import { LINK } from 'elements/link';
import { ListType } from 'elements/list';
import { MEDIA_EMBED } from 'elements/media-embed';
import { MENTION } from 'elements/mention';
import { PARAGRAPH } from 'elements/paragraph';
import { TableType } from 'elements/table';
import { createHyperscript } from 'slate-hyperscript';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
      editor: any;
      mention: any;
      actionitem: any;
      inline: any;
      htext: any;
    }
  }
}

const nodeTypes = {
  typeP: PARAGRAPH,
  typeMention: MENTION,
  typeBlockquote: BLOCKQUOTE,
  typeCodeBlock: CODE_BLOCK,
  typeLink: LINK,
  typeImg: IMAGE,
  typeMediaEmbed: MEDIA_EMBED,
  typeActionItem: ACTION_ITEM,
  typeTable: TableType.TABLE,
  typeTr: TableType.ROW,
  typeTd: TableType.CELL,
  typeUl: ListType.UL,
  typeOl: ListType.OL,
  typeLi: ListType.LI,
  typeH1: HeadingType.H1,
  typeH2: HeadingType.H2,
  typeH3: HeadingType.H3,
  typeH4: HeadingType.H4,
  typeH5: HeadingType.H5,
  typeH6: HeadingType.H6,
};

export const jsx = createHyperscript({
  elements: {
    hp: { type: nodeTypes.typeP },
    hmention: { type: nodeTypes.typeMention },
    hblockquote: { type: nodeTypes.typeBlockquote },
    hcode: { type: nodeTypes.typeCodeBlock },
    ha: { type: nodeTypes.typeLink },
    himg: { type: nodeTypes.typeImg },
    hembed: { type: nodeTypes.typeMediaEmbed },
    hactionitem: { type: nodeTypes.typeActionItem },
    htable: { type: nodeTypes.typeTable },
    htr: { type: nodeTypes.typeTr },
    htd: { type: nodeTypes.typeTd },
    hul: { type: nodeTypes.typeUl },
    hol: { type: nodeTypes.typeOl },
    hli: { type: nodeTypes.typeLi },
    hh1: { type: nodeTypes.typeH1 },
    hh2: { type: nodeTypes.typeH2 },
    hh3: { type: nodeTypes.typeH3 },
    hh4: { type: nodeTypes.typeH4 },
    hh5: { type: nodeTypes.typeH5 },
    hh6: { type: nodeTypes.typeH6 },
    inline: { inline: true },
    block: {},
  },
  creators: {
    htext: createText,
  },
});

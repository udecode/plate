import { createText } from '__test-utils__/hyperscript/creators';
import { ACTION_ITEM } from 'elements/action-item';
import { BLOCKQUOTE } from 'elements/blockquote';
import { CODE } from 'elements/code';
import { HeadingType } from 'elements/heading';
import { IMAGE } from 'elements/image';
import { LINK } from 'elements/link';
import { ListType } from 'elements/list';
import { MENTION } from 'elements/mention';
import { PARAGRAPH } from 'elements/paragraph';
import { TableType } from 'elements/table';
import { VIDEO } from 'elements/video';
import { createHyperscript } from 'slate-hyperscript';

const nodeTypes = {
  typeP: PARAGRAPH,
  typeMention: MENTION,
  typeBlockquote: BLOCKQUOTE,
  typeCode: CODE,
  typeLink: LINK,
  typeImg: IMAGE,
  typeVideo: VIDEO,
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
    p: { type: nodeTypes.typeP },
    mention: { type: nodeTypes.typeMention },
    blockquote: { type: nodeTypes.typeBlockquote },
    code: { type: nodeTypes.typeCode },
    link: { type: nodeTypes.typeLink },
    img: { type: nodeTypes.typeImg },
    video: { type: nodeTypes.typeVideo },
    actionitem: { type: nodeTypes.typeActionItem },
    table: { type: nodeTypes.typeTable },
    tr: { type: nodeTypes.typeTr },
    td: { type: nodeTypes.typeTd },
    ul: { type: nodeTypes.typeUl },
    ol: { type: nodeTypes.typeOl },
    li: { type: nodeTypes.typeLi },
    h1: { type: nodeTypes.typeH1 },
    h2: { type: nodeTypes.typeH2 },
    h3: { type: nodeTypes.typeH3 },
    h4: { type: nodeTypes.typeH4 },
    h5: { type: nodeTypes.typeH5 },
    h6: { type: nodeTypes.typeH6 },
    inline: { inline: true },
    block: {},
  },
  creators: {
    txt: createText,
  },
});

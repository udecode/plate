import { createHyperscript } from 'slate-hyperscript';
import { options } from '../../../../stories/config/initialValues';
import { createText } from './hyperscript/creators';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
      editor: any;
      mention: any;
      TodoList: any;
      inline: any;
      htext: any;
    }
  }
}

export const jsx = createHyperscript({
  elements: {
    hp: { type: options.p.type },
    hmention: { type: options.mention.type },
    hblockquote: { type: options.blockquote.type },
    hcode: { type: options.code_block.type },
    hcodeline: { type: options.code_line.type },
    ha: { type: options.link.type },
    himg: { type: options.img.type },
    hembed: { type: options.media_embed.type },
    hTodoList: { type: options.todo_li.type },
    htable: { type: options.table.type },
    htr: { type: options.tr.type },
    hth: { type: options.th.type },
    htd: { type: options.td.type },
    hul: { type: options.ul.type },
    hol: { type: options.ol.type },
    hli: { type: options.li.type },
    hh1: { type: options.h1.type },
    hh2: { type: options.h2.type },
    hh3: { type: options.h3.type },
    hh4: { type: options.h4.type },
    hh5: { type: options.h5.type },
    hh6: { type: options.h6.type },
    hcenter: { type: options.align_center.type },
    hjustify: { type: options.align_justify.type },
    inline: { inline: true },
    block: {},
  },
  creators: {
    htext: createText,
  },
});

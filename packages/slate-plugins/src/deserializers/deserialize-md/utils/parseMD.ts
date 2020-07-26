import unified from 'unified'
import markdown from 'remark-parse'
import slate from 'remark-slate'

export function parseMD(options: any) {
  return function parser(content: string) {
    const tree: any = unified()
      .use(markdown)
      .use(slate, {
        nodeTypes: {
          paragraph: options.p.type,
          block_quote: options.blockquote.type,
          link: options.link.type,
          ul_list: options.ul.type,
          ol_list: options.ol.type,
          listItem: options.li.type,
          heading: {
            1: options.h1.type,
            2: options.h2.type,
            3: options.h3.type,
            4: options.h4.type,
            5: options.h5.type,
            6: options.h6.type,
          },
        },
      })
      .processSync(content)

    return tree.result
  }
}

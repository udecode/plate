import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  TElement,
  TText,
} from '@udecode/plate'

export const createElement = (
  text = '',
  {
    type = ELEMENT_PARAGRAPH,
    mark,
  }: {
    type?: string
    mark?: string
  } = {}
) => {
  const leaf: TText = { text }
  if (mark) {
    leaf[mark] = true
  }

  return {
    type,
    children: [leaf],
  }
}

export const createList = (
  items: string[],
  { splitSeparator = '`' }: { splitSeparator?: string } = {}
): TElement[] => {
  const children: TElement[] = items.map((item) => {
    const texts = item.split(splitSeparator)
    const marks: TText[] = texts.map((text, index) => {
      const res: any = { text }
      if (index % 2 === 1) {
        res.code = true
      }
      return res
    })

    return {
      type: ELEMENT_LI,
      children: [
        {
          type: ELEMENT_LIC,
          children: marks,
        },
      ],
    }
  })

  return [
    {
      type: ELEMENT_UL,
      children,
    },
  ]
}

export const getNodesWithRandomId = (nodes: any[]) => {
  let _id = 10000
  nodes.forEach((node) => {
    node.id = _id
    _id++
  })

  return nodes
}

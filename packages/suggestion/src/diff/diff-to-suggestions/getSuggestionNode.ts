import { TDescendant } from '@udecode/plate-common'

export const getSuggestionNode = (
  node: TDescendant,
  {
    deletion,
  }: {
    deletion?: boolean
  } = {},
) => {
  const nextNode: TDescendant = {
    ...node,
    suggestion: true,
    suggestionId: '1',
    suggestion_0: true,
  }
  if (deletion) {
    nextNode.suggestionDeletion = true
  }

  return nextNode
}

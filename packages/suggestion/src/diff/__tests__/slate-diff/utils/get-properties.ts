import { TText } from '@udecode/plate-common'

// Get object that will set the properties of before
// to equal the properties of node, in terms of the
// slatejs set_node operation.  If before is not given,
// just gives all the non-text propers of goal.
export function getProperties(goal: TText, before?: TText): any {
  const props: any = {}
  for (const x in goal) {
    if (x !== 'text') {
      if (before == null) {
        if (goal[x]) {
          props[x] = goal[x]
        }
        // continue
      } else {
        if (goal[x] !== before[x]) {
          if (goal[x]) {
            props[x] = goal[x]
          } else {
            props[x] = undefined // remove property...
          }
        }
      }
    }
  }
  if (before != null) {
    // also be sure to explicitly remove props not in goal
    // WARNING: this might change in slatejs; I saw a discussion about this.
    for (const x in before) {
      if (x !== 'text' && goal[x] == null) {
        props[x] = undefined
      }
    }
  }
  return props
}

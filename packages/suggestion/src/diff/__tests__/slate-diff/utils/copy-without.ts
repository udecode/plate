// copy of map but without some keys
// I.e., restrict a function to the complement of a subset of the domain.
export function copyWithout(obj: object, w: string | string[]): object {
  if (typeof w === 'string') {
    w = [w]
  }
  const r = {}
  for (let key in obj) {
    const y = obj[key]
    if (!Array.from(w).includes(key)) {
      r[key] = y
    }
  }
  return r
}

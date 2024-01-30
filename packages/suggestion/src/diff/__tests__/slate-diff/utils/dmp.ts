const { diff_match_patch } = require('../diff-match-patch.js')

export const dmp = new diff_match_patch() as {
  diff_main: (a: string, b: string) => [number, string][]
  Diff_Timeout: number
}
dmp.Diff_Timeout = 0.2 // computing a diff won't block longer than about 0.2s

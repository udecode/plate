import { TDescendant } from '@udecode/plate-common';

const stringify = JSON.stringify;

// We could instead use
//    import * as stringify from "json-stable-stringify";
// which might sometimes avoid a safe "false positive" (i.e., slightly

// less efficient patch), but is significantly slower.
export function childrenToStrings(children: TDescendant[]): string[] {
  const v: string[] = [];
  for (const node of children) {
    v.push(stringify(node));
  }
  return v;
}

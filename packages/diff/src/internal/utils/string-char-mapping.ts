/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { TDescendant } from '@udecode/plate-common/server';
import isEqual from 'lodash/isEqual.js';

import { unusedCharGenerator } from './unused-char-generator';

export class StringCharMapping {
  private _charGenerator = unusedCharGenerator();
  private _mappedNodes: [TDescendant, string][] = [];

  public nodesToString(nodes: TDescendant[]): string {
    return nodes.map(this.nodeToChar.bind(this)).join('');
  }

  public nodeToChar(node: TDescendant): string {
    // Check for a previously assigned character
    for (const [n, c] of this._mappedNodes) {
      if (isEqual(n, node)) {
        return c;
      }
    }

    const c = this._charGenerator.next().value;
    this._mappedNodes.push([node, c]);
    return c;
  }

  public stringToNodes(s: string): TDescendant[] {
    return s.split('').map(this.charToNode.bind(this));
  }

  public charToNode(c: string): TDescendant {
    const entry = this._mappedNodes.find(([_node, c2]) => c2 === c);
    if (!entry) throw new Error(`No node found for char ${c}`);
    return entry[0];
  }
}

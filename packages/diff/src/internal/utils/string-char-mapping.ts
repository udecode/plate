/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import type { Descendant } from 'platejs';

import isEqual from 'lodash/isEqual.js';

import { unusedCharGenerator } from './unused-char-generator';

export class StringCharMapping {
  private readonly _charGenerator = unusedCharGenerator();
  private readonly _mappedNodes: [Descendant, string][] = [];

  charToNode(c: string): Descendant {
    const entry = this._mappedNodes.find(([_node, c2]) => c2 === c);

    if (!entry) throw new Error(`No node found for char ${c}`);

    return entry[0];
  }

  nodesToString(nodes: Descendant[]): string {
    return nodes.map(this.nodeToChar.bind(this)).join('');
  }

  nodeToChar(node: Descendant): string {
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

  stringToNodes(s: string): Descendant[] {
    return s.split('').map(this.charToNode.bind(this));
  }
}

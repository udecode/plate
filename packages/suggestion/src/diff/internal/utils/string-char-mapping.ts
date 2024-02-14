import { TDescendant } from '@udecode/plate-common';

export class StringCharMapping {
  private _nextChar: string = 'A';
  private _charToNode: Map<string, TDescendant> = new Map();
  private _keyToChar: Map<string, string> = new Map();

  public nodesToString(nodes: TDescendant[]): string {
    return nodes.map(this.nodeToChar.bind(this)).join('');
  }

  public nodeToChar(node: TDescendant): string {
    const key = this.getKeyForNode(node);

    const existingChar = this._keyToChar.get(key);
    if (existingChar) return existingChar;

    const c = this.getNextChar();

    this._keyToChar.set(key, c);
    this._charToNode.set(c, node);

    return c;
  }

  public stringToNodes(s: string): TDescendant[] {
    return s.split('').map(this.charToNode.bind(this));
  }

  public charToNode(c: string): TDescendant {
    const node = this._charToNode.get(c);
    if (!node) throw new Error(`No node found for char ${c}`);
    return node;
  }

  private getKeyForNode(node: TDescendant): string {
    return JSON.stringify(node);
  }

  private getNextChar(): string {
    const c = this._nextChar;
    this._nextChar = String.fromCodePoint(this._nextChar.codePointAt(0)! + 1);
    return c;
  }
}

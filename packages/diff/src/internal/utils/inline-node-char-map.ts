import {
  getNodeProps,
  isText,
  TDescendant,
  TText,
} from '@udecode/plate-common/server';

export class InlineNodeCharMap {
  private _charGenerator: Generator<string>;
  private _charToNode: Map<string, TDescendant> = new Map();

  constructor({ charGenerator }: { charGenerator: Generator<string> }) {
    this._charGenerator = charGenerator;
  }

  // Replace non-text nodes with a text node containing a unique char
  public nodeToText(node: TDescendant): TText {
    if (isText(node)) return node;
    const c = this._charGenerator.next().value;
    this._charToNode.set(c, node);
    return { text: c };
  }

  // Replace chars in text node with original nodes
  public textToNode(initialTextNode: TText): TDescendant[] {
    let outputNodes: TDescendant[] = [initialTextNode];

    for (const [c, originalNode] of this._charToNode) {
      outputNodes = this.replaceCharWithNode(outputNodes, c, originalNode);
    }

    return outputNodes;
  }

  private replaceCharWithNode(
    haystack: TDescendant[],
    needle: string,
    replacementNode: TDescendant
  ): TDescendant[] {
    return haystack.flatMap((haystackNode) => {
      if (!isText(haystackNode)) return [haystackNode];

      // 'Hello NEEDLE world NEEDLE' -> ['Hello ', ' world ', '']
      const splitText = haystackNode.text.split(needle);

      // Optimization
      if (splitText.length === 1) return [haystackNode];

      // Add props from the text node to the original node
      const replacementWithProps = {
        ...replacementNode,
        ...getNodeProps(haystackNode),
      };

      const nodesForTexts = splitText.map((text) => ({
        ...haystackNode,
        text,
      }));

      /**
       * [
       *   { text: 'Hello ' },
       *   { text: ' world ' },
       *   { text: '' }
       * ] -> [
       *   { text: 'Hello ' },
       *   replacementWithProps,
       *   { text: ' world ' },
       *   replacementWithProps,
       *   { text: '' },
       * ]
       */
      const nodeList = this.insertBetweenPairs(
        nodesForTexts,
        replacementWithProps
      );

      // Remove empty text nodes
      return nodeList.filter((n) => !isText(n) || n.text.length > 0);
    });
  }

  private insertBetweenPairs<T>(arr: T[], between: T): T[] {
    return arr.flatMap((x, i) => {
      if (i === arr.length - 1) return x;
      return [x, between];
    });
  }
}

import { type Descendant, type TText, NodeApi, TextApi } from '@udecode/plate';

export class InlineNodeCharMap {
  private _charGenerator: Generator<string>;
  private _charToNode = new Map<string, Descendant>();

  constructor({ charGenerator }: { charGenerator: Generator<string> }) {
    this._charGenerator = charGenerator;
  }

  private insertBetweenPairs<T>(arr: T[], between: T): T[] {
    return arr.flatMap((x, i) => {
      if (i === arr.length - 1) return x;

      return [x, between];
    });
  }

  private replaceCharWithNode(
    haystack: Descendant[],
    needle: string,
    replacementNode: Descendant
  ): Descendant[] {
    return haystack.flatMap((haystackNode) => {
      if (!TextApi.isText(haystackNode)) return [haystackNode];

      // 'Hello NEEDLE world NEEDLE' -> ['Hello ', ' world ', '']
      const splitText = haystackNode.text.split(needle);

      // Optimization
      if (splitText.length === 1) return [haystackNode];

      // Add props from the text node to the original node
      const replacementWithProps = {
        ...replacementNode,
        ...NodeApi.extractProps(haystackNode),
      };

      const nodesForTexts = splitText.map((text) => ({
        ...haystackNode,
        text,
      }));

      /**
       * [ { text: 'Hello ' }, { text: ' world ' }, { text: '' } ] -> [ { text:
       * 'Hello ' }, replacementWithProps, { text: ' world ' },
       * replacementWithProps, { text: '' }, ]
       */
      const nodeList = this.insertBetweenPairs(
        nodesForTexts,
        replacementWithProps
      );

      // Remove empty text nodes
      return nodeList.filter((n) => !TextApi.isText(n) || n.text.length > 0);
    });
  }

  // Replace non-text nodes with a text node containing a unique char
  public nodeToText(node: Descendant): TText {
    if (TextApi.isText(node)) return node;

    const c = this._charGenerator.next().value;
    this._charToNode.set(c, node);

    return { text: c };
  }

  // Replace chars in text node with original nodes
  public textToNode(initialTextNode: TText): Descendant[] {
    let outputNodes: Descendant[] = [initialTextNode];

    for (const [c, originalNode] of this._charToNode) {
      outputNodes = this.replaceCharWithNode(outputNodes, c, originalNode);
    }

    return outputNodes;
  }
}

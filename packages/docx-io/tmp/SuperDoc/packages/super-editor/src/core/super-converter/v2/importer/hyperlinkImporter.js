/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleHyperlinkNode = (params) => {
  const { nodes, docx, nodeListHandler } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:hyperlink') {
    return { nodes: [], consumed: 0 };
  }
  const node = nodes[0];

  const rels = docx['word/_rels/document.xml.rels'];
  const relationships = rels.elements.find((el) => el.name === 'Relationships');
  const { elements } = relationships;

  const { attributes } = node;
  const rId = attributes['r:id'];
  const anchor = attributes['w:anchor'];

  // TODO: Check if we need this atr
  // eslint-disable-next-line no-unused-vars
  const history = attributes['w:history'];

  const rel = elements.find((el) => el.attributes['Id'] === rId) || {};
  const { attributes: relAttributes = {} } = rel;
  let href = relAttributes['Target'];

  if (anchor && !href) href = `#${anchor}`;

  // Add marks to the run node and process it
  const runNodes = node.elements.filter((el) => el.name === 'w:r');
  const linkMark = { type: 'link', attrs: { href, rId } };

  for (const runNode of runNodes) {
    if (!runNode.marks) runNode.marks = [];
    runNode.marks.push(linkMark);

    const rPr = runNode.elements.find((el) => el.name === 'w:rPr');
    if (rPr) {
      const styleRel = rPr.elements.find((el) => el.name === 'w:rStyle');
      if (styleRel) {
        const styles = docx['word/styles.xml'];
        const { elements } = styles.elements[0];

        const styleElements = elements.filter((el) => el.name === 'w:style');
        const style = styleElements.find((el) => el.attributes['w:styleId'] === 'Hyperlink');
        const styleRpr = style?.elements?.find((el) => el.name === 'w:rPr');
        if (styleRpr) {
          styleRpr.elements.forEach((styleEl) => {
            const hasElInRPr = rPr.elements.find((el) => el.name === styleEl.name);
            if (!hasElInRPr) rPr.elements.push(styleEl);
          });
        }
      }
    }
  }

  const updatedNode = nodeListHandler.handler({ ...params, nodes: runNodes });
  return { nodes: updatedNode, consumed: 1 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const hyperlinkNodeHandlerEntity = {
  handlerName: 'hyperlinkNodeHandler',
  handler: handleHyperlinkNode,
};

import { twipsToPixels } from '../../helpers.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
const handleTabNode = (params) => {
  const { nodes, docx, parentStyleId } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:tab') {
    return { nodes: [], consumed: 0 };
  }
  const node = nodes[0];

  const styles = docx['word/styles.xml'];
  let stylePos;
  if (styles && styles.elements?.length) {
    const style = styles.elements[0]?.elements?.find((s) => s.attributes?.['w:styleId'] === parentStyleId);
    const pPr = style?.elements?.find((s) => s.name === 'w:pPr');
    const tabsDef = pPr?.elements?.find((s) => s.name === 'w:tabs');
    const firstTab = tabsDef?.elements?.find((s) => s.name === 'w:tab');

    // eslint-disable-next-line no-unused-vars
    stylePos = twipsToPixels(firstTab?.attributes?.['w:pos']);
  }

  const { attributes = {} } = node;
  const processedNode = {
    type: 'tab',
    attrs: {
      tabSize: attributes['w:val'] || 48,
    },
    content: [],
  };
  return { nodes: [processedNode], consumed: 1 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const tabNodeEntityHandler = {
  handlerName: 'tabNodeHandler',
  handler: handleTabNode,
};

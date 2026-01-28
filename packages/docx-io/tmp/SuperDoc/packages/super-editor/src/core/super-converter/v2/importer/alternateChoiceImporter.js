/**
 * @type {import("docxImporter").NodeHandler}
 */
const handleAlternateChoice = (params) => {
  const skipHandlerResponse = { nodes: [], consumed: 0 };
  const { nodes, nodeListHandler } = params;

  if (nodes.length === 0 || nodes[0].name !== 'w:p') {
    return skipHandlerResponse;
  }

  const mainNode = nodes[0];
  const node = mainNode?.elements?.find((el) => el.name === 'w:r');
  const hasAltChoice = node?.elements?.some((el) => el.name === 'mc:AlternateContent');

  if (!hasAltChoice) {
    return skipHandlerResponse;
  }

  const altChoiceNode = node.elements.find((el) => el.name === 'mc:AlternateContent');

  // eslint-disable-next-line no-unused-vars
  const altChoiceNodeIndex = node.elements.findIndex((el) => el.name === 'mc:AlternateContent');
  const allowedNamespaces = ['wps', 'wp14', 'w14', 'w15'];

  const wpsNode = altChoiceNode.elements.find(
    (el) => el.name === 'mc:Choice' && allowedNamespaces.includes(el.attributes['Requires']),
  );

  if (!wpsNode) {
    return skipHandlerResponse;
  }

  const contents = wpsNode.elements;
  const result = nodeListHandler.handler({
    ...params,
    nodes: contents,
  });

  return { nodes: result, consumed: 1 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const alternateChoiceHandler = {
  handlerName: 'alternateChoiceHandler',
  handler: handleAlternateChoice,
};

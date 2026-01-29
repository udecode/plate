import fontoxpath from 'fontoxpath';
import {
	parseXmlDocument,
	serializeToWellFormedString,
	Document as SlimdomDocument,
	type Node as SlimdomNode,
} from 'slimdom';

import {
	evaluateXPathToFirstNode,
	type INodesFactory,
	XQUERY_3_1_LANGUAGE,
} from './xquery.ts';

/**
 * Serialize an XML node to string using Slimdom's own serializer function, but with the "standard"
 * typing that Deno has for Node and Document.
 */
export function serialize(node: Node | Document) {
	return serializeToWellFormedString(node as unknown as SlimdomNode);
}

/**
 * Parse an XML string to DOM using Slimdom's own parser function, but with the "standard"
 * typing that Deno has for Node and Document -- so that type matching is not complicated further
 * down the line.
 */
export function parse(xml: string) {
	return parseXmlDocument(xml) as unknown as Document;
}

type UnknownObject = { [key: string]: unknown };

/**
 * Create a new XML DOM node using XQuery.
 */
export function create(
	query: string,
	variables?: UnknownObject,
	asDocument?: false
): Node;
/**
 * Create a new XML DOM element using XQuery, and return it as a Document.
 */
export function create(
	query: string,
	variables: UnknownObject,
	asDocument: true
): Document;
/**
 * Create a new XML DOM node using XQuery.
 *
 * For example:
 *   const el = create(`<derp>{$nerf}</derp>`, { nerf: 'skeet' });
 *   // Element <derp>skeet</derp>
 */
export function create(
	query: string,
	variables: UnknownObject = {},
	asDocument = false
): Node | Document {
	const node = evaluateXPathToFirstNode(query, null, null, variables, {
		language: XQUERY_3_1_LANGUAGE,
		nodesFactory: new SlimdomDocument() as unknown as INodesFactory,
	});
	if (!node) {
		throw new Error('Query did not result in a node');
	}
	if (asDocument) {
		const doc = new SlimdomDocument();
		doc.appendChild(node as unknown as SlimdomNode);
		return doc as unknown as Document;
	}
	return node;
}

/**
 * Run an XQuery Update Facility expression, maybe even repeatedly, which can change an existing DOM.
 *
 * Updates by references, returns an empty promise.
 */
export function update(
	dom: Node | Document,
	expression: string,
	times = 1
): void {
	while (times-- > 0) {
		fontoxpath.executePendingUpdateList(
			fontoxpath.evaluateUpdatingExpressionSync(
				expression,
				dom,
				null,
				{},
				{ debug: true }
			).pendingUpdateList
		);
	}
}

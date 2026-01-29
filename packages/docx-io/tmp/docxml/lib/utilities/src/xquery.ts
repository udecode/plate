/**
 * @file
 * Proxies most of the fontoxpath methods and fixes some of the typing around it. Also, XPath errors
 * will no longer have a stack trace pointing to the (minified) fontoxpath internals, but instead
 * tell you where the query was run from.
 */
// Import the file that registers custom XPath functions to the fontoxpath global;
import fontoxpath from 'fontoxpath';

import { DOCXML_NS_URI } from './xquery-functions.ts';

export type { INodesFactory } from 'fontoxpath';

export const XQUERY_3_1_LANGUAGE = fontoxpath.evaluateXPath.XQUERY_3_1_LANGUAGE;

const OPTIONS = {
	language: XQUERY_3_1_LANGUAGE,
	moduleImports: {
		docxml: DOCXML_NS_URI,
	},
};

export function evaluateXPath(
	...[query, node, domFacade, variables, returnType, options]: Parameters<
		typeof fontoxpath.evaluateXPath
	>
) {
	try {
		return fontoxpath.evaluateXPath(
			query,
			node,
			domFacade,
			variables,
			returnType,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToArray(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToArray
	>
) {
	try {
		return fontoxpath.evaluateXPathToArray(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToMap<P = Record<string, unknown>>(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToMap
	>
) {
	try {
		return fontoxpath.evaluateXPathToMap(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		) as P;
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToFirstNode<NodeGeneric extends Node = Node>(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToFirstNode
	>
) {
	try {
		return fontoxpath.evaluateXPathToFirstNode<NodeGeneric>(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).stack);
	}
}

export function evaluateXPathToNodes(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToNodes
	>
) {
	try {
		return fontoxpath.evaluateXPathToNodes<Node>(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToBoolean(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToBoolean
	>
) {
	try {
		return fontoxpath.evaluateXPathToBoolean(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToNumber(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToNumber
	>
) {
	try {
		return fontoxpath.evaluateXPathToNumber(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToString(
	...[query, node, domFacade, variables, options]: Parameters<
		typeof fontoxpath.evaluateXPathToString
	>
) {
	try {
		return fontoxpath.evaluateXPathToString(
			query,
			node,
			domFacade,
			variables,
			{
				...(options || {}),
				...OPTIONS,
			}
		);
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

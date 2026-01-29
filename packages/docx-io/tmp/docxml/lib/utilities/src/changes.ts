import { QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';

export type ChangeInformation = {
	id: number;
	author?: string;
	date?: Date;
};

/**
 * Parses common change tracking information from a given node.
 *
 * For convenience the node is "optional", in the sense that TS will not complain when passing in
 * the result of a query (which may or may not be strictly a node). If no node is passed, the
 * function will throw. Only use this function if you're already certain you have a change tracking
 * node.
 */
export function getChangeInformation(node?: Node | null) {
	if (!node) {
		throw new Error(`Unexpectedly missing node with change information.`);
	}
	const props = evaluateXPathToMap<{
		id: number;
		author?: string;
		date?: string;
	}>(
		`
			map {
				"id": ./@${QNS.w}id/number(),
				"author": ./@${QNS.w}author/string(),
				"date": ./@${QNS.w}date/string()
			}
		`,
		node
	);

	return {
		...props,
		author: props.author ? props.author : undefined,
		date: props.date ? new Date(props.date) : undefined,
	} as ChangeInformation;
}

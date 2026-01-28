// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Cell.ts';

import {
	type AnyComponent,
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type TableRowProperties,
	tableRowPropertiesFromNode,
	tableRowPropertiesToNode,
} from '../../../properties/src/table-row-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import {
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
} from '../../../utilities/src/xquery.ts';
import type { Cell } from './Cell.ts';
import { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Row}.
 */
export type RowChild = Cell;

/**
 * A type describing the props accepted by {@link Row}.
 */
export type RowProps = TableRowProperties;

/**
 * Parses the children (and no props yet) from an existing XML node.
 */
export function parsePropsAndChildNodes(
	node: Node
): RowProps & { children: Node[] } {
	return {
		...tableRowPropertiesFromNode(
			evaluateXPathToFirstNode(`./${QNS.w}trPr`, node)
		),
		children: evaluateXPathToNodes(
			`./${QNS.w}tc[
				not(./${QNS.w}tcPr/${QNS.w}vMerge/@${QNS.w}val = "continue")
			]`,
			node
		),
	};
}

/**
 * Creates an XML node for a given row.
 */
export async function createNodeFromRow(
	row: Row,
	ancestry: ComponentAncestor[]
): Promise<Node> {
	const table = ancestry.find(
		(ancestor): ancestor is Table => ancestor instanceof Table
	);
	if (!table) {
		throw new Error(
			'A row cannot be rendered outside the context of a table'
		);
	}
	const y = (ancestry[0].children as AnyComponent[]).indexOf(row);
	const anc = [row, ...ancestry];
	return create(
		`
			element ${QNS.w}tr {
				$trPr,
				$children
			}
		`,
		{
			trPr: await tableRowPropertiesToNode(row.props),
			children: await Promise.all(
				table.model.getCellsInRow(y).map((cell, x) => {
					const info = table.model.getCellInfo(cell);
					return info.column === x && info.row === y
						? cell.toNode(anc)
						: cell.toRepeatingNode(anc, x, y);
				})
			),
		}
	);
}

/**
 * A component that represents a table row.
 */
export class Row extends Component<RowProps, RowChild> {
	public static override readonly children: string[] = ['Cell'];
	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const node = await createNodeFromRow(this, ancestry);
		return node;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return evaluateXPathToBoolean(
			`
				self::${QNS.w}tr and
				not(./${QNS.w}trPr/${QNS.w}ins) and
				not(./${QNS.w}trPr/${QNS.w}del)
			`,
			node
		);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Row {
		const { children, ...props } = parsePropsAndChildNodes(node);
		return new Row(
			props,
			...createChildComponentsFromNodes<RowChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Row);

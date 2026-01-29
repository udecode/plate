// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import {
	checkForForbiddenParameters,
	isValidNumber,
} from '../../../utilities/src/parameter-checking.ts';
import './Row.ts';

import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../../../properties/src/table-properties.ts';
import type { ChangeInformation } from '../../../utilities/src/changes.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { type Length, twip } from '../../../utilities/src/length.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { TableGridModel } from '../../../utilities/src/tables.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { Row } from './Row.ts';

/**
 * A type describing the components accepted as children of {@link Table}.
 */
export type TableChild = Row;

/**
 * A type describing the props accepted by {@link Table}.
 */
export type TableProps = TableProperties & {
	columnWidths?: null | Length[];
	/**
	 * A property to specify that the table grid model has changed. This will be a tracked change in OOXML.
	 */
	columnWidthChange?:
		| null
		| (Omit<ChangeInformation, 'author' | 'date'> & { cols: Length[] });
};

/**
 * A component that represents a table.
 */
export class Table extends Component<TableProps, TableChild> {
	public static override readonly children: string[] = ['Row'];
	public static override readonly mixed: boolean = false;

	/**
	 * A conceptual description of how the cells, columns, rows and spans of this table make sense.
	 *
	 * Exposed so it can be accessed by {@link Row} and {@link Cell} descendants, but not meant
	 * to be used otherwise.
	 */
	public readonly model: TableGridModel = new TableGridModel(this);

	public constructor(tableProps: TableProps, ...tableChildren: TableChild[]) {
		checkForForbiddenParameters(tableProps, isValidNumber, true);
		super(tableProps, ...tableChildren);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const node = create(
			`
				element ${QNS.w}tbl {
					$tablePropertiesNode,
					if (exists($columnWidths)) then element ${QNS.w}tblGrid {
						for $columnWidth in array:flatten($columnWidths) return element ${QNS.w}gridCol {
							attribute ${QNS.w}w { $columnWidth }
						},
						if (exists($columnWidthChange)) then element ${QNS.w}tblGridChange { 
							attribute ${QNS.w}id { $columnWidthChange('id') },
							element ${QNS.w}tblGrid { 
								for $col in array:flatten($columnWidthChange('cols')) return element ${QNS.w}gridCol { 
									attribute ${QNS.w}w { $col }
								}
							} 
						} else ()
					} else (),
					$children
				}
			`,
			{
				tablePropertiesNode: tablePropertiesToNode(this.props),
				columnWidths: this.props.columnWidths?.length
					? this.props.columnWidths.map((width) =>
							Math.round(width.twip)
					  )
					: null,
				columnWidthChange: this.props.columnWidthChange
					? {
							id: this.props.columnWidthChange.id,
							cols: this.props.columnWidthChange.cols.map((col) =>
								Math.round(col.twip)
							),
					  }
					: null,
				children: await this.childrenToNode(ancestry),
			}
		);
		return node;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tbl';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Table {
		const { children, tblpr, ...props } = evaluateXPathToMap<{
			tblpr: Node;
			children: Node[];
			columnWidths: number[];
			columnWidthChange: { id: number; cols: number[] };
		}>(
			`
				map {
					"tblpr": ./${QNS.w}tblPr,
					"columnWidths": array {
						./${QNS.w}tblGrid/${QNS.w}gridCol/@${QNS.w}w/number()
					},
					"columnWidthChange": ./${QNS.w}tblGrid/${QNS.w}tblGridChange/map { 
						"id": @${QNS.w}id/number(),
						"cols": array { ./${QNS.w}tblGrid/${QNS.w}gridCol/@${QNS.w}w/number() }
					}, 
					"children": array { ./(${QNS.w}tr) }
				}
			`,
			node
		);
		return new Table(
			{
				...tablePropertiesFromNode(tblpr),
				columnWidths: props.columnWidths.map((size: number) =>
					twip(size)
				),
				columnWidthChange: props.columnWidthChange
					? {
							id: props.columnWidthChange.id,
							cols: props.columnWidthChange.cols.map(
								(size: number) => twip(size)
							),
					  }
					: null,
			},
			...createChildComponentsFromNodes<TableChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Table);

import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type TableCellProperties,
	tableCellPropertiesToNode,
} from '../../../properties/src/table-cell-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { twip } from '../../../utilities/src/length.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import {
	checkForForbiddenParameters,
	isValidNumber,
} from '../../../utilities/src/parameter-checking.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { Deletion } from '../../track-changes/src/Deletion.ts';
import type { Insertion } from '../../track-changes/src/Insertion.ts';
import type { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import { Paragraph } from './Paragraph.ts';
import { Row } from './Row.ts';
import { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Cell}.
 */
export type CellChild =
	| Paragraph
	| Table
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| Insertion
	| Deletion;

/**
 * A type describing the props accepted by {@link Cell}.
 */
export type CellProps = Omit<TableCellProperties, 'width'>;

/**
 * A component that represents a table cell.
 *
 * For MS Word to be happy any cell needs to have a paragraph as the last child. This component will
 * quietly fix that for you if you don't have a paragraph there already.
 */
export class Cell extends Component<CellProps, CellChild> {
	public static override readonly children: string[] = [
		'Paragraph',
		'Table',
		'BookmarkRangeStart',
		'BookmarkRangeEnd',
	];
	public static override readonly mixed: boolean = false;

	public constructor(cellProps: CellProps, ...cellChild: CellChild[]) {
		// Ensure that properties of type `number` are not `NaN`.
		checkForForbiddenParameters(cellProps, isValidNumber, true);
		super(cellProps, ...cellChild);
	}

	/**
	 * Get the with of the cell by keeping in mind the colspan property of cells.
	 * @returns The width of the cell or null.
	 */
	private getCellWidth(table: Table) {
		const colSpan = this.getColSpan();
		const info = table.model.getCellInfo(this);

		const colWidth = table.props.columnWidths?.[info.column];
		if (!colWidth) {
			return null;
		}

		let colSpanAcc = 0;
		for (let i = 0; i < colSpan; ++i) {
			colSpanAcc += table.props.columnWidths?.[info.column + i].twip || 0;
		}

		return twip(colSpanAcc);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const table = ancestry.find(
			(ancestor): ancestor is Table => ancestor instanceof Table
		);
		if (!table) {
			throw new Error(
				'A cell cannot be rendered outside the context of a table'
			);
		}

		const children = (await this.childrenToNode(ancestry)) as Node[];
		if (!(this.children[this.children.length - 1] instanceof Paragraph)) {
			// Cells must always end with a paragraph, or MS Word will complain about
			// file corruption.
			children.push(await new Paragraph({}).toNode([this, ...ancestry]));
		}

		return create(
			`element ${QNS.w}tc {
				$tcPr,
				$children
			}`,
			{
				tcPr: tableCellPropertiesToNode(
					{
						colSpan: this.getColSpan(),
						rowSpan: this.getRowSpan(),
						width: this.getCellWidth(table),
						...this.props,
					},
					false
				),
				children,
			}
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toRepeatingNode(
		ancestry: ComponentAncestor[],
		column: number,
		_row: number
	): Node | null {
		const table = ancestry.find(
			(ancestor): ancestor is Table => ancestor instanceof Table
		);
		if (!table) {
			throw new Error(
				'A cell cannot be rendered outside the context of a table'
			);
		}

		const info = table.model.getCellInfo(this);
		if (column > info.column) {
			// Colspans are only recorded on the left-most cell coordinate. No extra node needed;
			return null;
		}

		return create(
			`element ${QNS.w}tc {
				$tcPr,
				element ${QNS.w}p {}
			}`,
			{
				tcPr: tableCellPropertiesToNode(
					{
						width: this.getCellWidth(table),
						colSpan: this.getColSpan(),
						rowSpan: this.getRowSpan(),
						...this.props,
					},
					true
				),
			}
		);
	}

	/**
	 * Returns `true` when this cell has no visual representation because a column-spanning or row-
	 * spanning neighbour overlaps it.
	 */
	public isMergedAway(ancestry: ComponentAncestor[]): boolean {
		const row = ancestry.find(
			(ancestor): ancestor is Row => ancestor instanceof Row
		);
		if (!row) {
			throw new Error(
				'A cell cannot be rendered outside the context of a row'
			);
		}
		const table = ancestry.find(
			(ancestor): ancestor is Table => ancestor instanceof Table
		);
		if (!table) {
			throw new Error(
				'A cell cannot be rendered outside the context of a table'
			);
		}
		const x = row.children.indexOf(this);
		const y = table.children.indexOf(row);
		if (y === -1 || x === -1) {
			throw new Error('The cell is not part of this table');
		}

		const info = table.model.getCellInfo(this);
		return info.column !== x || info.row !== y;
	}

	public getColSpan(): number {
		return this.props.colSpan || 1;
	}

	public getRowSpan(): number {
		return this.props.rowSpan || 1;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tc';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(
		node: Node,
		context: ComponentContext
	): null | Cell {
		const { mergedAway, children, ...props } = evaluateXPathToMap<
			CellProps & { mergedAway: boolean; children: Node[] }
		>(
			`
				let $colStart := docxml:cell-column(.)

				let $rowStart := count(../preceding-sibling::${QNS.w}tr)

				let $firstNextRow := ../following-sibling::${QNS.w}tr[
					child::${QNS.w}tc[docxml:spans-cell-column(., $colStart) and not(
						./${QNS.w}tcPr/${QNS.w}vMerge[
							@${QNS.w}val = "continue" or
							not(./@${QNS.w}val)
						]
					)]
				][1]

				let $rowEnd := if ($firstNextRow)
					then count($firstNextRow/preceding-sibling::${QNS.w}tr)
					else count(../../${QNS.w}tr)

				let $mergeCell := boolean(./${QNS.w}tcPr/${QNS.w}vMerge[not(./@${QNS.w}val)])

				return map {
					"mergedAway": $mergeCell,
					"colSpan": if (./${QNS.w}tcPr/${QNS.w}gridSpan)
						then ./${QNS.w}tcPr/${QNS.w}gridSpan/@${QNS.w}val/number()
						else 1,
					"rowSpan": $rowEnd - $rowStart,
					"children": array{ ./(${QNS.w}p) },
					"verticalAlignment": ./${QNS.w}tcPr/${QNS.w}vAlign/@${QNS.w}val/string(),
					"insertion": ./${QNS.w}tcPr/${QNS.w}cellIns/map {
						"id": @${QNS.w}id/number(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string()
					},
					"deletion": ./${QNS.w}tcPr/${QNS.w}cellDel/map {
						"id": @${QNS.w}id/number(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string()
					}
				}
			`,
			node
		);
		if (mergedAway) {
			return null;
		}

		// Convert the date string to a Date object.
		if (props.insertion) {
			props.insertion.date = props.insertion.date
				? new Date(props.insertion.date)
				: undefined;
			props.insertion.author = props.insertion.author
				? props.insertion.author
				: undefined;
		}

		if (props.deletion) {
			props.deletion.date = props.deletion.date
				? new Date(props.deletion.date)
				: undefined;
			props.deletion.author = props.deletion.author
				? props.deletion.author
				: undefined;
		}

		return new Cell(
			props,
			...createChildComponentsFromNodes<CellChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Cell);

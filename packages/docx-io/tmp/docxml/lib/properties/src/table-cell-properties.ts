import { CellDeletion } from '../../components/track-changes/src/CellDeletion.ts';
import { CellInsertion } from '../../components/track-changes/src/CellInsertion.ts';
import type { DeletionProps } from '../../components/track-changes/src/Deletion.ts';
import type { InsertionProps } from '../../components/track-changes/src/Insertion.ts';
import type { ChangeInformation } from '../../utilities/src/changes.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { NamespaceUri, QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';
import type { Border, LineBorderType, Shading } from './shared-properties.ts';

export type TableCellProperties = {
	/**
	 * The amount of columns spanned by this cell. Defaults to `1`.
	 */
	colSpan?: null | number;
	/**
	 * The amount of rows spanned by this cell. Defaults to `1`.
	 */
	rowSpan?: null | number;
	/**
	 * The width of this cell.
	 */
	width?: null | Length;
	/**
	 * The background color of this cell, optionally with a pattern in a secondary color.
	 */
	shading?: null | Shading;
	/**
	 * The border on any side of this cell, or between diagonally across in either direction.
	 */
	borders?: null | {
		top?: null | Border<LineBorderType>;
		start?: null | Border<LineBorderType>;
		bottom?: null | Border<LineBorderType>;
		end?: null | Border<LineBorderType>;
		insideH?: null | Border<LineBorderType>;
		insideV?: null | Border<LineBorderType>;
		/**
		 * Diagonally from top-left to bottom-right. Like a backward slash.
		 */
		tl2br?: null | Border<LineBorderType>;
		/**
		 * Diagonally from top-right to bottom-left. Like a forward slash.
		 */
		tr2bl?: null | Border<LineBorderType>;
	};
	/**
	 * The vertical alignment of this cell.
	 */
	verticalAlignment?: null | 'bottom' | 'center' | 'top';
	/**
	 * A property used to indicate when a cell has been inserted.
	 *
	 * If present, the containing cell element will appear as a track-change inserted cell.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_cellIns_topic_ID0EQ1OV.html
	 */
	insertion?: null | InsertionProps;
	/**
	 * A property used to indicate when a cell has been deleted.
	 *
	 * If present, the containing cell element will appear as a track-change deleted cell.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_cellDel_topic_ID0E5IOV.html
	 */
	deletion?: null | DeletionProps;
	/**
	 * A property used to indicate when the properties of a table cell should appear as a
	 * tracked change when the document is opened in Word.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_tcPrChange_topic_ID0EEKVW.html
	 *
	 */
	change?: null | (ChangeInformation & Omit<TableCellProperties, 'change'>);
};

type IntermediateProps = Omit<TableCellProperties, 'change'> & {
	change?: ChangeInformation & { node: Node | undefined };
};

export function tableCellPropertiesFromNode(
	node?: Node | null
): TableCellProperties {
	const props = node
		? evaluateXPathToMap<IntermediateProps>(
				`
				let $colStart := docxml:cell-column(.)

				let $rowStart := count(../../preceding-sibling::${QNS.w}tr)

				(: The first next row that contains a new cell in this column :)
				let $firstNextRow := ../../following-sibling::${QNS.w}tr[
					child::${QNS.w}tc[
						docxml:cell-column(.) = $colStart and
						not(
							./${QNS.w}tcPr/${QNS.w}vMerge[
								@${QNS.w}val = "continue" or
								not(./@${QNS.w}val)
							]
						)
					]
				][1]

				let $rowEnd := if ($firstNextRow)
					then count($firstNextRow/preceding-sibling::${QNS.w}tr)
					else count(../../../${QNS.w}tr)

				return map {
					"width": if (${QNS.w}tcW)
						then docxml:length(${QNS.w}tcW/@${QNS.w}w, 'twip') 
						else (),
					"colSpan": if (./${QNS.w}gridSpan)
						then ./${QNS.w}gridSpan/@${QNS.w}val/number()
						else 1,
					"rowSpan": if ($rowEnd != $rowStart)
						then $rowEnd - $rowStart
						else 1,
					"shading": ./${QNS.w}shd/docxml:ct-shd(.),
					"borders": ./${QNS.w}tcBorders/map {
						"top": docxml:ct-border(${QNS.w}top),
						"start": docxml:ct-border((${QNS.w}start|${QNS.w}left)[1]),
						"bottom": docxml:ct-border(${QNS.w}bottom),
						"end": docxml:ct-border((${QNS.w}end|${QNS.w}right)[1]),
						"tl2br": docxml:ct-border(${QNS.w}tl2br),
						"tr2bl": docxml:ct-border(${QNS.w}tr2bl),
						"insideH": docxml:ct-border(${QNS.w}insideH),
						"insideV": docxml:ct-border(${QNS.w}insideV)
					},
					"verticalAlignment": ./${QNS.w}vAlign/@${QNS.w}val/string(),
					"insertion": ./${QNS.w}cellIns/map {
						"id": @${QNS.w}id/number(), 
						"author": @${QNS.w}author/string(), 
						"date": @${QNS.w}date/string()
					},
					"deletion": ./${QNS.w}cellDel/map {
						"id": @${QNS.w}id/number(), 
						"author": @${QNS.w}author/string(), 
						"date": @${QNS.w}date/string()
					},
					"change": ./${QNS.w}tcPrChange/map { 
						"id": @${QNS.w}id/number(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(), 
						"node": ./${QNS.w}tcPr
					}
				}
				`,
				node
		  )
		: {};

	if (props.change) {
		props.change = {
			...props.change,
			id: props.change.id,
			date: props.change.date ? new Date(props.change.date) : undefined,
			...tableCellPropertiesFromNode(props.change.node),
			node: undefined,
		};
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

	return props as TableCellProperties;
}

export function tableCellPropertiesToNode(
	tcpr: TableCellProperties = {},
	asRepeatingNode: boolean
): Node | null {
	if (!Object.keys(tcpr).length) {
		return null;
	}

	return create(
		`element ${QNS.w}tcPr {
			if (exists($width)) then element ${QNS.w}tcW {
				attribute ${QNS.w}w { $width },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if ($colSpan > 1) then element ${QNS.w}gridSpan {
				attribute ${QNS.w}val { $colSpan }
			} else (),
			if ($asRepeatingNode) then element ${QNS.w}vMerge {
				attribute ${QNS.w}val { "continue" }
			} else (
				if ($rowSpan > 1) then element ${QNS.w}vMerge {
					attribute ${QNS.w}val { "restart" }
				} else ()
			),
			docxml:ct-shd(fn:QName("${NamespaceUri.w}", "shd"), $shading),
			if (exists($borders)) then element ${QNS.w}tcBorders {
				(: In sequence order: :)
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "start"), $borders('start')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "end"), $borders('end')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "tl2br"), $borders('tl2br')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "tr2bl"), $borders('tr2bl')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
			} else (),
			if (exists($verticalAlignment)) then element ${QNS.w}vAlign {
				attribute ${QNS.w}val { $verticalAlignment }
			} else (),
			if (exists($change)) then element ${QNS.w}tcPrChange { 
				attribute ${QNS.w}id { $change('id') },
				if ($change('author')) then attribute ${QNS.w}author { $change('author') } else (),
				if ($change('date')) then attribute ${QNS.w}date { $change('date')} else (),
				$change('node')
			} else (),
			$insertion,
			$deletion
		}`,
		{
			asRepeatingNode: !!asRepeatingNode,
			colSpan: tcpr.colSpan || 1,
			rowSpan: tcpr.rowSpan || 1,
			width: tcpr.width ? Math.round(tcpr.width.twip) : null,
			shading: tcpr.shading || null,
			borders: tcpr.borders
				? {
						top: null,
						left: null,
						bottom: null,
						right: null,
						insideH: null,
						insideV: null,
						tl2br: null,
						tr2bl: null,
						...tcpr.borders,
				  }
				: null,
			verticalAlignment: tcpr.verticalAlignment || null,
			change: tcpr.change
				? {
						id: tcpr.change.id,
						author: tcpr.change.author
							? tcpr.change.author
							: undefined,
						date: tcpr.change.date
							? new Date(tcpr.change.date).toISOString()
							: undefined,
						node: tableCellPropertiesToNode(tcpr.change, true),
				  }
				: null,
			insertion: tcpr.insertion
				? new CellInsertion(tcpr.insertion).toNode()
				: null,
			deletion: tcpr.deletion
				? new CellDeletion(tcpr.deletion).toNode()
				: null,
		}
	);
}

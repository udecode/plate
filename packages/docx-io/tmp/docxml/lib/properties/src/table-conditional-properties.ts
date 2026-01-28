import { create } from '../../utilities/src/dom.ts';
import { QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from './paragraph-properties.ts';
import {
	type TableCellProperties,
	tableCellPropertiesFromNode,
	tableCellPropertiesToNode,
} from './table-cell-properties.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from './table-properties.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from './text-properties.ts';

export type TableConditionalTypes =
	// The formatting applies to odd numbered groupings of rows
	| 'band1Horz'
	// The formatting applies to odd numbered groupings of columns
	| 'band1Vert'
	// The formatting applies to even numbered groupings of rows
	| 'band2Horz'
	// The formatting applies to even numbered groupings of columns
	| 'band2Vert'
	// The formatting applies to the first column
	| 'firstCol'
	// The formatting applies to the first row
	| 'firstRow'
	// The formatting applies to the last column
	| 'lastCol'
	// The formatting applies to the last row
	| 'lastRow'
	// The formatting applies to the top right cell
	| 'neCell'
	// The formatting applies to the top left cell
	| 'nwCell'
	// The formatting applies to the bottom right cell
	| 'seCell'
	// The formatting applies to the bottom left cell
	| 'swCell'
	// The formatting applies to the whole table
	| 'wholeTable';
/**
 * The typing for <w:tblStylePr>
 *
 * @see http://www.datypic.com/sc/ooxml/e-w_tblStylePr-1.html
 */
export type TableConditionalProperties = {
	type: TableConditionalTypes;
	cell?: null | TableCellProperties;
	paragraph?: null | ParagraphProperties;
	text?: null | TextProperties;
	table?: null | TableProperties;
};

export function tableConditionalPropertiesFromNode(
	node: Node
): TableConditionalProperties {
	const { pPr, rPr, tblPr, tcPr, ...rest } = evaluateXPathToMap<{
		type: TableConditionalTypes;
		pPr?: Element;
		rPr?: Element;
		tblPr?: Element;
		tcPr?: Element;
	}>(
		`map {
			"type": ./@${QNS.w}type/string(),
			"pPr": ./${QNS.w}pPr,
			"rPr": ./${QNS.w}rPr,
			"tblPr": ./${QNS.w}tblPr,
			"tcPr": ./${QNS.w}tcPr
		}`,
		node
	);

	const properties: TableConditionalProperties = {
		...rest,
		paragraph: pPr ? paragraphPropertiesFromNode(pPr) : null,
		text: rPr ? textPropertiesFromNode(rPr) : null,
		table: tblPr ? tablePropertiesFromNode(tblPr) : null,
		cell: tcPr ? tableCellPropertiesFromNode(tcPr) : null,
	};

	return properties;
}

export async function tableConditionalPropertiesToNode(
	tblpr: TableConditionalProperties
): Promise<Node> {
	return create(
		`element ${QNS.w}tblStylePr {
			attribute ${QNS.w}type { $type },
			$pPr,
			$rPr,
			$tblPr,
			$tcPr
		}`,
		{
			...tblpr,
			pPr: tblpr.paragraph
				? await paragraphPropertiesToNode(tblpr.paragraph)
				: null,
			rPr: tblpr.text ? await textPropertiesToNode(tblpr.text) : null,
			tblPr: tblpr.table ? tablePropertiesToNode(tblpr.table) : null,
			tcPr: tblpr.cell
				? tableCellPropertiesToNode(tblpr.cell, false)
				: null,
		}
	);
}

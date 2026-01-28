import type { TableProps } from '../../components/document/src/Table.ts';
import type { ChangeInformation } from '../../utilities/src/changes.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { NamespaceUri, QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';
import type {
	ArtBorderType,
	Border,
	LineBorderType,
} from './shared-properties.ts';

export type TableProperties = {
	/**
	 * Show this table according to the style that is referenced through this style identifier.
	 */
	style?: string | null;
	/**
	 * Sets the width for the entire table, can be either a percent or absolute measurement.
	 */
	width?:
		| null
		| number
		| '`${number}%'
		| string
		| {
				length: '`${number}%' | string | number;
				unit: null | 'nil' | 'auto' | 'dxa' | 'pct' | undefined;
		  }
		| undefined;
	/**
	 * When set to `true`, the column widths as specified to the {@link Table} component are used
	 * strictly. If not set, or set to `false`, the specified column widths are considered a
	 * preference only, and may change depending on the column contents.
	 */
	strictColumnWidths?: boolean | null;
	/**
	 * The distance with which this table is indented from the left page boundary.
	 */
	indentation?: null | Length;
	/**
	 * The distance between cells.
	 */
	cellSpacing?: null | Length;
	/**
	 * If banding is used, specifies how many rows constitute one banded group.
	 */
	rowBandingSize?: null | number;
	/**
	 * If banding is used, specifies how many columns constitute one banded group.
	 */
	columnBandingSize?: null | number;
	/**
	 * The conditions that will be evaluated for conditional formatting of table parts.
	 *
	 * @todo rename to something more descriptive?
	 */
	activeConditions?: null | {
		firstColumn?: null | boolean;
		lastColumn?: null | boolean;
		firstRow?: null | boolean;
		lastRow?: null | boolean;
		noHBand?: null | boolean;
		noVBand?: null | boolean;
	};
	/**
	 * The cell padding, space between its border and its contents, for each side of a cell.
	 */
	cellPadding?: null | {
		top?: null | Length;
		bottom?: null | Length;
		start?: null | Length;
		end?: null | Length;
	};
	borders?: null | {
		top?: null | Border<LineBorderType | ArtBorderType>;
		start?: null | Border<LineBorderType | ArtBorderType>;
		bottom?: null | Border<LineBorderType | ArtBorderType>;
		end?: null | Border<LineBorderType | ArtBorderType>;
		insideH?: null | Border<LineBorderType | ArtBorderType>;
		insideV?: null | Border<LineBorderType | ArtBorderType>;
	};
	change?: null | (ChangeInformation & Omit<TableProperties, 'change'>);
};

type IntermediateProps = Omit<TableProperties, 'change'> & {
	change?: ChangeInformation & { node: Node | null };
};

export function tablePropertiesFromNode(node: Node | null): TableProperties {
	const properties = node
		? evaluateXPathToMap<IntermediateProps>(
				`map {
					"style": ./${QNS.w}tblStyle/@${QNS.w}val/string(),
					"activeConditions": ./${QNS.w}tblLook/map {
						"firstColumn": docxml:st-on-off(@${QNS.w}firstColumn),
						"lastColumn": docxml:st-on-off(@${QNS.w}lastColumn),
						"firstRow": docxml:st-on-off(@${QNS.w}firstRow),
						"lastRow": docxml:st-on-off(@${QNS.w}lastRow),
						"noHBand": docxml:st-on-off(@${QNS.w}noHBand),
						"noVBand": docxml:st-on-off(@${QNS.w}noVBand)
					},
					"indentation": docxml:length(${QNS.w}tblInd[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
					"cellSpacing": docxml:length(${QNS.w}tblCellSpacing[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
					"cellPadding": ./${QNS.w}tblCellMar/map {
						"top": docxml:length(${QNS.w}top[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
						"start": docxml:length((${QNS.w}start|${QNS.w}left)[not(@${QNS.w}type = 'nil')][1]/@${QNS.w}w, 'twip'),
						"bottom": docxml:length(${QNS.w}bottom[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
						"end": docxml:length((${QNS.w}end|${QNS.w}right)[not(@${QNS.w}type = 'nil')][1]/@${QNS.w}w, 'twip')
					},
					"columnBandingSize": ./${QNS.w}tblStyleColBandSize/@${QNS.w}val/number(),
					"rowBandingSize": ./${QNS.w}tblStyleRowBandSize/@${QNS.w}val/number(),
					"borders": ./${QNS.w}tblBorders/map {
						"top": docxml:ct-border(${QNS.w}top),
						"start": docxml:ct-border((${QNS.w}start|${QNS.w}left)[1]),
						"bottom": docxml:ct-border(${QNS.w}bottom),
						"end": docxml:ct-border((${QNS.w}end|${QNS.w}right)[1]),
						"insideH": docxml:ct-border(${QNS.w}insideH),
						"insideV": docxml:ct-border(${QNS.w}insideV)
					},
					"width": ./${QNS.w}tblW/map {
						"length": ./@${QNS.w}w/string(),
						"unit": ./@${QNS.w}type/string()
					},
					"strictColumnWidths": boolean(./${QNS.w}tblLayout/@${QNS.w}type = "fixed"), 
					"change": ./${QNS.w}tblPrChange/map { 
						"id": @${QNS.w}id/number(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(),
						"node": ./${QNS.w}tblPr
					}
				}`,
				node
		  )
		: {};
	if (properties.change) {
		properties.change = {
			...properties.change,
			id: properties.change.id,
			date: properties.change.date
				? new Date(properties.change.date)
				: undefined,
			...tablePropertiesFromNode(properties.change.node),
			node: null,
		};
	}

	return properties as TableProperties;
}

export function tablePropertiesToNode(tblpr: TableProps = {}): Node {
	return create(
		`element ${QNS.w}tblPr {
			if ($style) then element ${QNS.w}tblStyle {
				attribute ${QNS.w}val { $style }
			} else (),
			if (exists($width)) then element ${QNS.w}tblW {
				attribute ${QNS.w}w { $width('length') },
				attribute ${QNS.w}type { $width('unit') }
			} else (),
			if (exists($activeConditions)) then element ${QNS.w}tblLook {
				if ($activeConditions('firstColumn')) then attribute ${QNS.w}firstColumn { "1" } else attribute ${QNS.w}firstColumn { "0" },
				if ($activeConditions('firstRow')) then attribute ${QNS.w}firstRow { "1" } else attribute ${QNS.w}firstRow { "0" },
				if ($activeConditions('lastColumn')) then attribute ${QNS.w}lastColumn { "1" } else attribute ${QNS.w}lastColumn { "0" } ,
				if ($activeConditions('lastRow')) then attribute ${QNS.w}lastRow { "1" } else attribute ${QNS.w}lastRow { "0" },
				if ($activeConditions('noHBand')) then attribute ${QNS.w}noHBand { "1" } else attribute ${QNS.w}noHBand { "0" },
				if ($activeConditions('noVBand')) then attribute ${QNS.w}noVBand { "1" } else attribute ${QNS.w}noVBand { "0" }
			} else (),
			if (exists($cellPadding)) then element ${QNS.w}tblCellMar {
				if (exists($cellPadding('top'))) then element ${QNS.w}top {
					attribute ${QNS.w}w { round($cellPadding('top')('twip')) },
					attribute ${QNS.w}type { "dxa" }
				} else (),
				if (exists($cellPadding('bottom'))) then element ${QNS.w}bottom {
					attribute ${QNS.w}w { round($cellPadding('bottom')('twip')) },
					attribute ${QNS.w}type { "dxa" }
				} else (),
				if (exists($cellPadding('start'))) then element ${QNS.w}start {
					attribute ${QNS.w}w { round($cellPadding('start')('twip')) },
					attribute ${QNS.w}type { "dxa" }
				} else (),
				if (exists($cellPadding('end'))) then element ${QNS.w}end {
					attribute ${QNS.w}w { round($cellPadding('end')('twip')) },
					attribute ${QNS.w}type { "dxa" }
				} else ()
			} else (),
			if (exists($borders)) then element ${QNS.w}tblBorders {
				(: In sequence order: :)
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "start"), $borders('start')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "end"), $borders('end')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
			} else (),
			if (exists($indentation)) then element ${QNS.w}tblInd {
				attribute ${QNS.w}w { round($indentation('twip')) },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if (exists($cellSpacing)) then element ${QNS.w}tblCellSpacing {
				attribute ${QNS.w}w { round($cellSpacing('twip')) },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if (exists($columnBandingSize)) then element ${QNS.w}tblStyleColBandSize {
				attribute ${QNS.w}val { $columnBandingSize }
			} else (),
			if (exists($rowBandingSize)) then element ${QNS.w}tblStyleRowBandSize {
				attribute ${QNS.w}val { $rowBandingSize }
			} else (),
			if ($strictColumnWidths) then element ${QNS.w}tblLayout {
				attribute ${QNS.w}type { "fixed" }
			} else (),
			if (exists($change)) then element ${QNS.w}tblPrChange { 
				attribute ${QNS.w}id { $change('id') },
				if (exists($change('author'))) then attribute ${QNS.w}author { $change('author') } else (),
				if (exists($change('date'))) then attribute ${QNS.w}date { $change('date') } else (),
				$change('node')
			} else () 
		}`,
		{
			style: tblpr.style || null,
			activeConditions: tblpr.activeConditions || null,
			width:
				typeof tblpr.width === 'string' && tblpr.width.endsWith('%')
					? { length: tblpr.width, unit: 'pct' }
					: typeof tblpr.width === 'number'
					? {
							length: tblpr.width,
							unit: 'dxa',
					  }
					: tblpr.width || null,
			cellPadding: tblpr.cellPadding || null,
			borders: tblpr.borders
				? {
						top: null,
						start: null,
						bottom: null,
						end: null,
						insideH: null,
						insideV: null,
						...tblpr.borders,
				  }
				: null,
			indentation: tblpr.indentation || null,
			cellSpacing: tblpr.cellSpacing || null,
			columnBandingSize: tblpr.columnBandingSize || null,
			rowBandingSize: tblpr.rowBandingSize || null,
			strictColumnWidths: tblpr.strictColumnWidths || false,
			change: tblpr.change
				? {
						id: tblpr.change.id,
						author: tblpr.change.author
							? tblpr.change.author
							: undefined,
						date: tblpr.change.date
							? new Date(tblpr.change.date).toISOString()
							: undefined,
						node: tablePropertiesToNode(tblpr.change),
				  }
				: null,
		}
	);
}

import type { ChangeInformation } from '../../utilities/src/changes.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { NamespaceUri, QNS } from '../../utilities/src/namespaces.ts';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
} from '../../utilities/src/xquery.ts';
import {
	type SectionProperties,
	sectionPropertiesToNode,
} from './section-properties.ts';
import type { Border, LineBorderType, Shading } from './shared-properties.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from './text-properties.ts';

export function getTwipOrNull(
	length: Length | null | undefined
): number | null {
	return length && length.twip !== undefined && length.twip !== null
		? length.twip
		: null;
}

/**
 * All the formatting properties that can be given to a paragraph.
 *
 * Serializes to the <w:pPr> element.
 *   http://officeopenxml.com/WPparagraphProperties.php
 *   http://www.datypic.com/sc/ooxml/e-w_pPr-6.html
 */
export type ParagraphProperties = {
	/**
	 * The horizontal alignment of text in this paragraph.
	 */
	alignment?: 'left' | 'right' | 'center' | 'both' | null;
	/**
	 * The level or indentation at which this paragraph lives as a table-of-contents item.
	 */
	outlineLvl?: number | null;
	/**
	 * Show this paragraph according to the style that is referenced through this style identifier.
	 */
	style?: string | null;
	/**
	 * Extra vertical whitespace before, after and/or between the lines of this paragraph.
	 */
	spacing?: {
		before?: Length | null;
		after?: Length | null;
		line?: Length | null;
		lineRule?: 'atLeast' | 'exactly' | 'auto' | null;
		afterAutoSpacing?: boolean | null;
		beforeAutoSpacing?: boolean | null;
	} | null;
	/**
	 * Extra horizontal whitespace before or after this paragraph, or for the first line only.
	 */
	indentation?: {
		hanging?: Length | null;
		hangingChars?: number | null;
		firstLine?: Length | null;
		firstLineChars?: number | null;
		start?: Length | null;
		startChars?: number | null;
		end?: Length | null;
		endChars?: number | null;
	} | null;
	/**
	 * The border on any side of this paragraph, or between other paragraphs of the same style.
	 */
	borders?: null | {
		top?: null | Border<LineBorderType>;
		left?: null | Border<LineBorderType>;
		bottom?: null | Border<LineBorderType>;
		right?: null | Border<LineBorderType>;
		between?: null | Border<LineBorderType>;
	};
	/**
	 * The background color of this paragraph, optionally with a pattern in a secondary color.
	 */
	shading?: null | Shading;
	/**
	 * Configuration of the list bulleting given to this paragraph.
	 */
	listItem?: null | {
		numbering?: null | number;
		depth?: null | number;
	};
	/**
	 * Change tracking info for this paragraph.
	 */
	change?: null | (ChangeInformation & Omit<ParagraphProperties, 'change'>);
	pageBreakBefore?: null | boolean;
	/**
	 * Used for formatting of the `rPr` elements at the top level of a paragraph.
	 * This is text property changes applied to the whole parent paragraph.
	 */
	pilcrow?: TextProperties | null;

	/**
	 * Properties in styles for tabs.
	 */
	tabs?: Array<
		Partial<{
			type:
				| 'bar'
				| 'center'
				| 'clear'
				| 'clear'
				| 'decimal'
				| 'left'
				| 'num'
				| 'right'
				| null;
			leader:
				| 'dot'
				| 'heavy'
				| 'hyphen'
				| 'middleDot'
				| 'none'
				| 'underscore'
				| null;
			position: Length | null;
		}>
	>;
};

export function paragraphPropertiesFromNode(
	node?: Node | null
): ParagraphProperties {
	const data = node
		? // deno-lint-ignore no-explicit-any
		  evaluateXPathToMap<any>(
				`map {
					"alignment": ${QNS.w}jc/@${QNS.w}val/string(),
					"outlineLvl": ${QNS.w}outlineLvl/@${QNS.w}val/number(),
					"style": ${QNS.w}pStyle/@${QNS.w}val/string(),
					"spacing": ${QNS.w}spacing/map {
						"before": docxml:length(@${QNS.w}before, 'twip'),
						"after": docxml:length(@${QNS.w}after, 'twip'),
						"line": docxml:length(@${QNS.w}line, 'twip'),
						"lineRule": @${QNS.w}lineRule/string(),
						"afterAutoSpacing": docxml:st-on-off(@${QNS.w}afterAutoSpacing),
						"beforeAutoSpacing": docxml:st-on-off(@${QNS.w}beforeAutoSpacing)
					},
					"indentation": ${QNS.w}ind/map {
						"start": docxml:length((@${QNS.w}start|@${QNS.w}left)[1], 'twip'),
						"startChars": (@${QNS.w}startChars|@${QNS.w}leftChars)[1]/number(),
						"end": docxml:length((@${QNS.w}end|@${QNS.w}right)[1], 'twip'),
						"endChars": (@${QNS.w}endChars|@${QNS.w}rightChars)/number(),
						"hanging": docxml:length(@${QNS.w}hanging, 'twip'),
						"hangingChars": @${QNS.w}hangingChars/number(),
						"firstLine": docxml:length(@${QNS.w}firstLine, 'twip'),
						"firstLineChars": @${QNS.w}firstLineChars/number()
					},
					"shading": ./${QNS.w}shd/docxml:ct-shd(.),
					"borders": ./${QNS.w}pBdr/map {
						"top": docxml:ct-border(${QNS.w}top),
						"left": docxml:ct-border(${QNS.w}left),
						"bottom": docxml:ct-border(${QNS.w}bottom),
						"right": docxml:ct-border(${QNS.w}right),
						"between": docxml:ct-border(${QNS.w}between)
					},
					"listItem": ./${QNS.w}numPr/map {
						"numbering": ./${QNS.w}numId/@${QNS.w}val/number(),
						"depth": ./${QNS.w}ilvl/@${QNS.w}val/number()
					},
					"change": ${QNS.w}pPrChange/map {
						"id": @${QNS.w}id/number(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(),
						"_node": ./${QNS.w}pPr
					},
					"pageBreakBefore": docxml:ct-on-off(./${QNS.w}pageBreakBefore), 
					"tabs": ./${QNS.w}tabs/array {${QNS.w}tab/map {
						"type": @${QNS.w}val/string(),
						"leader": @${QNS.w}leader/string(),
						"position": docxml:length(@${QNS.w}pos, 'twip')
					}}
				}`,
				node
		  ) || {}
		: {};

	const rpr = node && evaluateXPathToFirstNode(`./${QNS.w}rPr`, node);

	if (rpr) {
		data.pilcrow = textPropertiesFromNode(rpr);
	}
	if (data.change) {
		data.change = {
			...data.change,
			date: data.change.date ? new Date(data.change.date) : undefined,
			author: data.change.author ? data.change.author : undefined,
			...paragraphPropertiesFromNode(data.change._node),
			_node: undefined,
		};
	} else {
		delete data.change;
	}
	return data;
}

export async function paragraphPropertiesToNode(
	data: ParagraphProperties = {},
	sectionProperties: SectionProperties | null = null
): Promise<Node | null> {
	if (!Object.keys(data).length && !sectionProperties) {
		return null;
	}

	return create(
		`
			element ${QNS.w}pPr {
				if (exists($style)) then element ${QNS.w}pStyle {
					attribute ${QNS.w}val { $style }
				} else (),
				if (exists($listItem)) then element ${QNS.w}numPr {
					if (exists($listItem('numbering'))) then element ${QNS.w}numId {
						attribute ${QNS.w}val { $listItem('numbering') }
					} else (),
					if (exists($listItem('depth'))) then element ${QNS.w}ilvl {
						attribute ${QNS.w}val { $listItem('depth') }
					} else ()
				} else (),
				if (exists($alignment)) then element ${QNS.w}jc {
					attribute ${QNS.w}val { $alignment }
				} else (),
				if (exists($outlineLvl)) then element ${QNS.w}outlineLvl {
					attribute ${QNS.w}val { $outlineLvl }
				} else (),
				docxml:ct-shd(fn:QName("${NamespaceUri.w}", "shd"), $shading),
				if (exists($spacing)) then element ${QNS.w}spacing {
					if (exists($spacing('before'))) then attribute ${QNS.w}before {
						$spacing('before')
					} else (),
					if (exists($spacing('after'))) then attribute ${QNS.w}after {
						$spacing('after')
					} else (),
					if (exists($spacing('line'))) then attribute ${QNS.w}line {
						$spacing('line')
					} else (),
					if (exists($spacing('lineRule'))) then attribute ${QNS.w}lineRule {
						$spacing('lineRule')
					} else (),
					if (exists($spacing('afterAutoSpacing'))) then attribute ${QNS.w}afterAutoSpacing {
						$spacing('afterAutoSpacing')
					} else (),
					if (exists($spacing('beforeAutoSpacing'))) then attribute ${QNS.w}beforeAutoSpacing {
						$spacing('beforeAutoSpacing')
					} else ()
				} else (),

				if (exists($indentation)) then element ${QNS.w}ind {
					if (exists($indentation('start'))) then attribute ${QNS.w}start {
						$indentation('start')
					} else (),
					if (exists($indentation('startChars'))) then attribute ${QNS.w}startChars {
						$indentation('startChars')
					} else (),
					if (exists($indentation('end'))) then attribute ${QNS.w}end {
						$indentation('end')
					} else (),
					if (exists($indentation('endChars'))) then attribute ${QNS.w}endChars {
						$indentation('endChars')
					} else (),
					if (exists($indentation('hanging'))) then attribute ${QNS.w}hanging {
						$indentation('hanging')
					} else (),
					if (exists($indentation('hangingChars'))) then attribute ${QNS.w}hangingChars {
						$indentation('hangingChars')
					} else (),
					if (exists($indentation('firstLine'))) then attribute ${QNS.w}firstLine {
						$indentation('firstLine')
					} else (),
					if (exists($indentation('firstLineChars'))) then attribute ${QNS.w}firstLineChars {
						$indentation('firstLineChars')
					} else ()
				} else (),

				if (exists($borders)) then element ${QNS.w}pBdr {
					(: In sequence order: :)
					docxml:ct-border(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
					docxml:ct-border(fn:QName("${NamespaceUri.w}", "left"), $borders('left')),
					docxml:ct-border(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
					docxml:ct-border(fn:QName("${NamespaceUri.w}", "right"), $borders('right')),
					docxml:ct-border(fn:QName("${NamespaceUri.w}", "between"), $borders('between'))
				} else (),

				$rpr,
				$sectpr,

				if (exists($pageBreakBefore)) then element ${QNS.w}pageBreakBefore { 
						attribute ${QNS.w}val { $pageBreakBefore } 
				} else (),

				if (exists($change)) then element ${QNS.w}pPrChange {
					attribute ${QNS.w}id { $change('id') },
					if ($change('date')) then attribute ${QNS.w}date { $change('date') } else (),
					if ($change('author')) then attribute ${QNS.w}author { $change('author') } else (),
					$change('node')
				} else (),

				if (exists($tabs)) then element ${QNS.w}tabs {
					for $tab in array:flatten($tabs)
						return element ${QNS.w}tab {
							if (exists($tab('type'))) then attribute ${QNS.w}val {
								$tab('type')
							} else (),
							if (exists($tab('leader'))) then attribute ${QNS.w}leader {
								$tab('leader')
							} else (),
							if (exists($tab('position'))) then attribute ${QNS.w}pos {
								$tab('position')
							} else ()
						}
				} else ()
			}
		`,
		{
			style: data.style || null,
			alignment: data.alignment || null,
			outlineLvl:
				data.outlineLvl === null || data.outlineLvl === undefined
					? null
					: data.outlineLvl,
			indentation: data.indentation
				? {
						...data.indentation,
						hanging: getTwipOrNull(data.indentation.hanging),
						firstLine: getTwipOrNull(data.indentation.firstLine),
						start: getTwipOrNull(data.indentation.start),
						end: getTwipOrNull(data.indentation.end),
				  }
				: null,
			shading: data.shading || null,
			spacing: data.spacing
				? {
						...data.spacing,
						before: getTwipOrNull(data.spacing.before),
						after: getTwipOrNull(data.spacing.after),
						line: getTwipOrNull(data.spacing.line),
						lineRule: data.spacing.lineRule || null,
				  }
				: null,
			borders: data.borders
				? {
						top: null,
						left: null,
						bottom: null,
						right: null,
						between: null,
						...data.borders,
				  }
				: null,
			listItem: data.listItem || null,
			pageBreakBefore: data.pageBreakBefore || null,
			change: data.change
				? {
						id: data.change.id,
						author: data.change.author
							? data.change.author
							: undefined,
						date: data.change.date
							? data.change.date.toISOString()
							: undefined,
						node: await paragraphPropertiesToNode(data.change),
				  }
				: null,
			rpr: await textPropertiesToNode(data.pilcrow || undefined),
			sectpr:
				sectionProperties && sectionPropertiesToNode(sectionProperties),
			tabs: data.tabs?.length
				? data.tabs?.map((tab) => ({
						type: tab.type,
						leader: tab.leader,
						position: getTwipOrNull(tab.position),
				  }))
				: null,
		}
	);
}

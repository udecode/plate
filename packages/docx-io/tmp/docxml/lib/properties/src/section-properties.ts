import type { FootnoteProps } from '../../components/document/src/FootnoteReference.ts';
import type { ChangeInformation } from '../../utilities/src/changes.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';

/**
 * Formatting options that are applied on the Section level.
 * For more on how OOXML secitons are structured: http://officeopenxml.com/WPsection.php
 */

export type SectionProperties = {
	/**
	 * The column layout for this section.
	 */
	columns?: {
		/**
		 * The number of columns in a section of text. If  this property is present it must
		 * be an integer greater than 0 and less than or equal to 45.
		 */
		numberOfColumns?: number;
		/**
		 * Specifies whether all columns are of equal width.
		 */
		equalWidth?: boolean;
		/**
		 * Specifies whether a vertical line is to be drawn between each column. If set to true, then the line is drawn in the center of the space between the columns.
		 */
		separator?: boolean;
		/**
		 * The width of a column of text. If an array of columns is provided in the `columnDefs`
		 * property, then this value is ignored.
		 */
		columnSpace?: Length;
		/**
		 * To create sections that use columns of different widths or uneven spacing, you can define
		 * columns as an array of objects. This is _only_ used by Word if the `equalWidth`
		 * property is not true.
		 */
		columnDefs?: { columnWidth: Length; columnSpace?: Length }[];
	};

	/**
	 * A reference to the header portion on every page in this section.
	 */
	headers?:
		| null
		| string
		| { first?: string | null; even?: string | null; odd?: string | null };
	/**
	 * A reference to the footer portion on every page in this section.
	 */
	footers?:
		| null
		| string
		| { first?: string | null; even?: string | null; odd?: string | null };

	footnotes?: null | FootnoteProps;
	/**
	 * The width of any page in this section.
	 */
	pageWidth?: null | Length;
	/**
	 * The height of any page in this section.
	 */
	pageHeight?: null | Length;
	/**
	 * The supposed orientation noted for pages in this section. Overridden by `.pageWidth` or `.pageHeight`
	 * when they are set.
	 */
	pageOrientation?: null | 'landscape' | 'portrait';

	/**
	 * The space between content and various other boundaries in the page layout.
	 */
	pageMargin?: {
		top?: null | Length;
		right?: null | Length;
		bottom?: null | Length;
		left?: null | Length;
		header?: null | Length;
		footer?: null | Length;
		gutter?: null | Length;
	};

	pageBreakType?:
		| 'continuous'
		| 'evenPage'
		| 'nextColumn'
		| 'nextPage'
		| 'oddPage'
		| null;
	/**
	 * Specifies whether sections in the document shall have different headers and footers for even and odd pages.
	 */
	isTitlePage?: null | boolean;

	/**
	 * Change tracking info about this section--used for Word's track changes feature.
	 */
	change?: null | (Omit<SectionProperties, 'change'> & ChangeInformation);
};

type IntermediateProps = Omit<SectionProperties, 'change'> & {
	change?: {
		id: number;
		author?: string;
		date?: Date;
		node: Node | undefined;
	};
};

export function sectionPropertiesFromNode(
	node?: Node | null
): SectionProperties {
	if (!node) {
		return {};
	}

	const props = node
		? evaluateXPathToMap<IntermediateProps>(
				`map {
					"headers": map {
						"first": ./${QNS.w}headerReference[@${QNS.w}type = 'first']/@${QNS.r}id/string(),
						"even": ./${QNS.w}headerReference[@${QNS.w}type = 'even']/@${QNS.r}id/string(),
						"odd": ./${QNS.w}headerReference[@${QNS.w}type = 'default']/@${QNS.r}id/string()
					},
					"footers": map {
						"first": ./${QNS.w}footerReference[@${QNS.w}type = 'first']/@${QNS.r}id/string(),
						"even": ./${QNS.w}footerReference[@${QNS.w}type = 'even']/@${QNS.r}id/string(),
						"odd": ./${QNS.w}footerReference[@${QNS.w}type = 'default']/@${QNS.r}id/string()
					},
					"columns": map {
						"numberOfColumns": ./${QNS.w}cols/@${QNS.w}num/number(),
						"equalWidth": docxml:st-on-off(./${QNS.w}cols/@${QNS.w}equalWidth),
						"separator": if (exists(./${QNS.w}cols/@${QNS.w}sep)) then docxml:st-on-off(./${QNS.w}cols/@${QNS.w}sep) else (),
						"columnSpace": docxml:length(./${QNS.w}cols/@${QNS.w}space, 'twip'),
						"columnDefs": array{
								./${QNS.w}cols/${QNS.w}col/map{ 
									"columnWidth": docxml:length(@${QNS.w}w, 'twip'), 
									"columnSpace": docxml:length(@${QNS.w}space, 'twip')
							}
						}
					},
					"pageWidth": docxml:length(${QNS.w}pgSz/@${QNS.w}w, 'twip'),
					"pageHeight": docxml:length(${QNS.w}pgSz/@${QNS.w}h, 'twip'),
					"pageOrientation": ./${QNS.w}pgSz/@${QNS.w}orient/string(),
					"pageMargin": map {
						"top": docxml:length(./${QNS.w}pgMar/@${QNS.w}top, 'twip'),
						"right": docxml:length(./${QNS.w}pgMar/@${QNS.w}right, 'twip'),
						"bottom": docxml:length(./${QNS.w}pgMar/@${QNS.w}bottom, 'twip'),
						"left": docxml:length(./${QNS.w}pgMar/@${QNS.w}left, 'twip'),
						"header": docxml:length(./${QNS.w}pgMar/@${QNS.w}header, 'twip'),
						"footer": docxml:length(./${QNS.w}pgMar/@${QNS.w}footer, 'twip'),
						"gutter": docxml:length(./${QNS.w}pgMar/@${QNS.w}gutter, 'twip')
					},
					"pageBreakType": ./${QNS.w}type/@${QNS.w}val/string(),  
					"isTitlePage": exists(./${QNS.w}titlePg) and (not(./${QNS.w}titlePg/@${QNS.w}val) or docxml:st-on-off(./${QNS.w}titlePg/@${QNS.w}val)), 
					"change": ./${QNS.w}sectPrChange/map { 
						"id": @${QNS.w}id/number(), 
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(),
						"node": ./${QNS.w}sectPr
					}
				}`,
				node
		  ) || {}
		: {};

	if (props.change) {
		props.change = {
			...props.change,
			date: props.change.date ? new Date(props.change.date) : undefined,
			author: props.change.author ? props.change.author : undefined,
			...sectionPropertiesFromNode(props.change.node),
			node: undefined,
		};
	} else {
		delete props.change;
	}

	return props as SectionProperties;
}

export function sectionPropertiesToNode(data: SectionProperties = {}): Node {
	return create(
		`element ${QNS.w}sectPr {
			if (exists($footnotes)) then element ${QNS.w}footnotePr {
				if (exists($footnotes('numberingFormat')))
				then element ${QNS.w}numFmt { 
					attribute ${QNS.w}val { $footnotes('numberingFormat')}
				} else (),
				if (exists($footnotes('position')))
				then element ${QNS.w}pos { 
					attribute ${QNS.w}val { $footnotes('position')}
				} else (),
				if (exists($footnotes('restart'))) 
				then element ${QNS.w}numRestart { 
					attribute ${QNS.w}val { $footnotes('restart')}
				} else ()
			} else (), 
			if (exists($headers('first'))) then element ${QNS.w}headerReference {
				attribute ${QNS.r}id { $headers('first') },
				attribute ${QNS.w}type { 'first' }
			} else (),
			if (exists($headers('even'))) then element ${QNS.w}headerReference {
				attribute ${QNS.r}id { $headers('even') },
				attribute ${QNS.w}type { 'even' }
			} else (),
			if (exists($headers('odd'))) then element ${QNS.w}headerReference {
				attribute ${QNS.r}id { $headers('odd') },
				attribute ${QNS.w}type { 'default' }
			} else (),
			if (exists($footers('first'))) then element ${QNS.w}footerReference {
				attribute ${QNS.r}id { $footers('first') },
				attribute ${QNS.w}type { 'first' }
			} else (),
			if (exists($footers('even'))) then element ${QNS.w}footerReference {
				attribute ${QNS.r}id { $footers('even') },
				attribute ${QNS.w}type { 'even' }
			} else (),
			if (exists($footers('odd'))) then element ${QNS.w}footerReference {
				attribute ${QNS.r}id { $footers('odd') },
				attribute ${QNS.w}type { 'default' }
			} else (),
			if (exists($columns)) then element ${QNS.w}cols {
				if (exists($columns('separator'))) then attribute ${QNS.w}sep { 
					$columns('separator') } 
				else (),
				if (exists($columns('numberOfColumns'))) then attribute ${QNS.w}num {
					$columns('numberOfColumns') 
				} else (),
				if (exists($columns('columnSpace'))) then attribute ${QNS.w}space {
					round($columns('columnSpace')('twip')) 
				} else (),
				if (exists($columns('equalWidth'))) then 
					if ($columns('equalWidth')) then attribute ${QNS.w}equalWidth { "1" } 
					else (attribute ${QNS.w}equalWidth { "0" })
				else (),
 				if (docxml:st-on-off(string($columns('equalWidth')))) then ()
 				else for $column in array:flatten($columns('columnDefs'))
 					return element ${QNS.w}col {
 						attribute ${QNS.w}w { round($column('columnWidth')('twip')) },
 						if (not(exists($column('columnSpace')))) then ()
 						else attribute ${QNS.w}space { round($column('columnSpace')('twip')) }
 					}
			} else (), 
			if (exists($pageWidth) or exists($pageHeight) or $pageOrientation) then element ${QNS.w}pgSz {
				if (exists($pageWidth)) then attribute ${QNS.w}w {
					round($pageWidth('twip'))
				} else (),
				if (exists($pageHeight)) then attribute ${QNS.w}h {
					round($pageHeight('twip'))
				} else (),
				if ($pageOrientation) then attribute ${QNS.w}orient { $pageOrientation } else ()
			} else (),
			if (exists($pageMargin)) then element ${QNS.w}pgMar {
				if (exists($pageMargin('top'))) then attribute ${QNS.w}top {
					round($pageMargin('top')('twip'))
				} else (),
				if (exists($pageMargin('right'))) then attribute ${QNS.w}right {
					round($pageMargin('right')('twip'))
				} else (),
				if (exists($pageMargin('bottom'))) then attribute ${QNS.w}bottom {
					round($pageMargin('bottom')('twip'))
				} else (),
				if (exists($pageMargin('left'))) then attribute ${QNS.w}left {
					round($pageMargin('left')('twip'))
				} else (),
				if (exists($pageMargin('header'))) then attribute ${QNS.w}header {
					round($pageMargin('header')('twip'))
				} else (),
				if (exists($pageMargin('footer'))) then attribute ${QNS.w}footer {
					round($pageMargin('footer')('twip'))
				} else (),
				if (exists($pageMargin('gutter'))) then attribute ${QNS.w}gutter {
					round($pageMargin('gutter')('twip'))
				} else ()
			} else (),
			if (exists($pageBreakType)) then element ${QNS.w}type { attribute ${QNS.w}val { $pageBreakType } } else (),
			if (exists($isTitlePage)) then element ${QNS.w}titlePg { attribute ${QNS.w}val { "1" } } else (), 
			if (exists($change)) then element ${QNS.w}sectPrChange { 
				attribute ${QNS.w}id { $change('id') }, 
				if ($change('date')) then attribute ${QNS.w}date { $change('date') } else (),
				if ($change('author')) then attribute ${QNS.w}author { $change('author') } else (),
				$change('node')
			} else ()
 		}`,
		{
			headers:
				typeof data.headers === 'string'
					? {
							first: data.headers,
							even: data.headers,
							odd: data.headers,
					  }
					: data.headers || {},
			footers:
				typeof data.footers === 'string'
					? {
							first: data.footers,
							even: data.footers,
							odd: data.footers,
					  }
					: data.footers || {},
			footnotes: data.footnotes || {},
			columns: data.columns || {},
			pageWidth: data.pageWidth || null,
			pageHeight: data.pageHeight || null,
			pageMargin: data.pageMargin || null,
			pageOrientation: data.pageOrientation || null,
			pageBreakType: data.pageBreakType || null,
			isTitlePage: data.isTitlePage || null,
			change: data.change
				? {
						id: data.change.id,
						author: data.change.author
							? data.change.author
							: undefined,
						date: data.change.date
							? data.change.date.toISOString()
							: undefined,
						node: sectionPropertiesToNode(data.change),
				  }
				: null,
		}
	);
}

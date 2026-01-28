import { Deletion } from '../../components/track-changes/src/Deletion.ts';
import {
	Insertion,
	type InsertionProps,
} from '../../components/track-changes/src/Insertion.ts';
import type { ChangeInformation } from '../../utilities/src/changes.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';

export type TableRowProperties = {
	/**
	 * Specifies that the current row should be repeated at the top each new page on which the table
	 * is displayed. This can be specified for multiple rows to generate a multi-row header. Note
	 * that if the row is not the first row, then the property will be ignored.
	 */
	isHeaderRow?: null | boolean;
	/**
	 * If `true`, it prevents the contents of the row from breaking across multiple pages by moving
	 * the start of the row to the start of a new page. If the contents cannot fit on a single page,
	 * the row will start on a new page and flow onto multiple pages.
	 */
	isUnsplittable?: null | boolean;
	/**
	 * The distance between cells.
	 */
	cellSpacing?: null | Length;
	/**
	 * A property used to indicate when a table row property has changed. This will appear as a tracked
	 * change in Word's track changes feature.
	 */
	change?: null | (ChangeInformation & Omit<TableRowProperties, 'change'>);
	/**
	 * A property used to indicate when a row has been inserted.
	 *
	 * If present, the containing row element will appear as a track-change inserted row.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EA14V.html
	 */
	insertion?: null | InsertionProps;
	/**
	 * A property used to indicate when a row has been deleted.
	 *
	 * If present, the containing row element will appear as a track-change deleted row.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_del_topic_ID0EH23V.html
	 */
	deletion?: null | InsertionProps;
};

type IntermediateProps = Omit<TableRowProperties, 'change'> & {
	change?: ChangeInformation & { node: Node | undefined };
};

export function tableRowPropertiesFromNode(
	node?: Node | null
): TableRowProperties {
	if (!node) {
		return {};
	}

	const props = node
		? evaluateXPathToMap<IntermediateProps>(
				`map {
					"isHeaderRow": docxml:ct-on-off(./${QNS.w}tblHeader),
					"isUnsplittable": docxml:ct-on-off(./${QNS.w}cantSplit),
					"cellSpacing": docxml:length(${QNS.w}tblCellSpacing[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
					"change": ./${QNS.w}trPrChange/map {
						"id": @${QNS.w}id/number(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(),
						"node": ./${QNS.w}trPr
					},
					"insertion": ./${QNS.w}ins/map {
						"id": @${QNS.w}id/number(), 
						"author": @${QNS.w}author/string(), 
						"date": @${QNS.w}date/string()
					},
					"deletion": ./${QNS.w}del/map {
						"id": @${QNS.w}id/number(), 
						"author": @${QNS.w}author/string(), 
						"date": @${QNS.w}date/string()
					}
				}`,
				node
		  ) || {}
		: {};
	// Convert the date string to a Date object.
	if (props.change) {
		props.change = {
			...props.change,
			id: props.change.id,
			date: props.change.date ? new Date(props.change.date) : undefined,
			...tableRowPropertiesFromNode(props.change.node),
			node: undefined,
		};
	}

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

	return props as TableRowProperties;
}

export async function tableRowPropertiesToNode(
	trpr: TableRowProperties = {}
): Promise<Node | null> {
	if (!Object.keys(trpr).length) {
		return null;
	}
	return create(
		`element ${QNS.w}trPr {
			if ($isHeaderRow) then element ${QNS.w}tblHeader {} else (),
			if ($isUnsplittable) then element ${QNS.w}cantSplit {} else (),
			if (exists($cellSpacing)) then element ${QNS.w}tblCellSpacing {
				attribute ${QNS.w}w { round($cellSpacing('twip')) },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if (exists($change)) then element ${QNS.w}trPrChange { 
				attribute ${QNS.w}id { $change('id') }, 
				if ($change('author')) then attribute ${QNS.w}author { $change('author') } else (), 
				if ($change('date')) then attribute ${QNS.w}date { $change('date') } else (),
				$change('node') 
			} else (),
			$insertion,
			$deletion
		}`,
		{
			isHeaderRow: trpr.isHeaderRow || false,
			isUnsplittable: trpr.isUnsplittable || false,
			cellSpacing: trpr.cellSpacing || null,
			change: trpr.change
				? {
						id: trpr.change.id,
						author: trpr.change.author
							? trpr.change.author
							: undefined,
						date: trpr.change.date
							? new Date(trpr.change.date).toISOString()
							: undefined,
						node: await tableRowPropertiesToNode(trpr.change),
				  }
				: null,
			insertion: trpr.insertion
				? await new Insertion(trpr.insertion).toNode([])
				: null,
			deletion: trpr.deletion
				? await new Deletion(trpr.deletion).toNode([])
				: null,
		}
	);
}

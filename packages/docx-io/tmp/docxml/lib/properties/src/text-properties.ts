import { Deletion, Insertion, type InsertionProps } from '../../../mod.ts';
import {
	MoveFrom,
	type MoveFromProps,
} from '../../components/track-changes/src/MoveFrom.ts';
import {
	MoveTo,
	type MoveToProps,
} from '../../components/track-changes/src/MoveTo.ts';
import type { ChangeInformation } from '../../utilities/src/changes.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { NamespaceUri, QNS } from '../../utilities/src/namespaces.ts';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
} from '../../utilities/src/xquery.ts';
import type { Shading } from './shared-properties.ts';

type SimpleOrComplex<Generic> = {
	simple?: Generic | null;
	complex?: Generic | null;
};

function explodeSimpleOrComplex<Generic>(
	value: Generic | SimpleOrComplex<Generic> | null
): Required<SimpleOrComplex<Generic>> | null {
	if (value === null) {
		return { simple: null, complex: null };
	}
	if (
		(value as SimpleOrComplex<Generic>).simple === undefined &&
		(value as SimpleOrComplex<Generic>).complex === undefined
	) {
		return {
			simple: (value as Generic) || null,
			complex: (value as Generic) || null,
		};
	}
	return {
		simple: (value as SimpleOrComplex<Generic>).simple || null,
		complex: (value as SimpleOrComplex<Generic>).complex || null,
	};
}

/**
 * All the formatting options that can be given on a text run (inline text).
 *
 * Serializes to the <w:rPr> element.
 *   https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_rPr_topic_ID0EIEKM.html
 */
export type TextProperties = {
	/**
	 * Show this text according to the style that is referenced through this style identifier.
	 */
	style?: string | null;
	/**
	 * The color of this text. Type as a hexidecimal code (`"ff0000"`) or a basic color name (`"red"`).
	 */
	color?: string | null;
	/**
	 * The background color of this paragraph, optionally with a pattern in a secondary color.
	 */
	shading?: null | Shading;
	/**
	 * The baseline position of this text.
	 */
	verticalAlign?: 'baseline' | 'subscript' | 'superscript' | null;
	/**
	 * Display this text with an underline, and if so, what kind of line.
	 */
	isUnderlined?:
		| null
		| boolean
		| 'single'
		| 'words'
		| 'double'
		| 'thick'
		| 'dotted'
		| 'dottedHeavy'
		| 'dash'
		| 'dashedHeavy'
		| 'dashLong'
		| 'dashLongHeavy'
		| 'dotDash'
		| 'dashDotHeavy'
		| 'dotDotDash'
		| 'dashDotDotHeavy'
		| 'wave'
		| 'wavyHeavy'
		| 'wavyDouble'
		| 'none';
	/**
	 * Display extra thick characters, or not.
	 */
	isBold?: boolean | SimpleOrComplex<boolean> | null;
	/**
	 * Display text with a slant, or not.
	 */
	isItalic?: boolean | SimpleOrComplex<boolean> | null;
	/**
	 * Display text as capital letters, or not.
	 */
	isCaps?: boolean | null;
	/**
	 * Display text as small capital letters, or not.
	 */
	isSmallCaps?: boolean | null;
	/**
	 * The language of this bit of text, for spell checking.
	 */
	language?: string | null;
	/**
	 * The size of your font.
	 */
	fontSize?: Length | SimpleOrComplex<Length> | null;
	/**
	 * If the font size is equal or larger to `.minimumKerningFontSize`, font kerning should be applied.
	 */
	minimumKerningFontSize?: Length | null;
	/**
	 * Display text with a strike-through, or not.
	 */
	isStrike?: boolean | null;
	/**
	 * The space between letters.
	 */
	spacing?: Length | null;
	/**
	 * The name of the font family used for this text. Set as either a string, or as an object if you
	 * want more control over different font variations.
	 */
	font?:
		| string
		| {
				cs?: string;
				ascii?: string;
				hAnsi?: string;
		  };
	/**
	 * A property used to indicate when an entire paragraph has moved.
	 *
	 * If present, the containing paragraph element will appear as a track-change moved paragraph.
	 *
	 * Read more here:
	 * https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveTo_topic_ID0EE3IW.html and
	 * https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_moveFrom_topic_ID0EJ6EW.html
	 **/
	moveTo?: MoveToProps | null;
	moveFrom?: MoveFromProps | null;

	/**
	 * A property used to indicate that the way this text is deiplayed has changed somehow.
	 * When track changes are enabled in Word, these properties will apppear as
	 * having been editied.
	 *
	 * Move information about text run propertie can be found here:
	 * https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_rPrChange_topic_ID0E4JSW.html?hl=rprchange
	 */
	change?: (ChangeInformation & Omit<TextProperties, 'change'>) | null;

	/**
	 * A property used to indicate when a paragraph has been inserted.
	 *
	 * If present, the containing paragraph element will appear as a track-change inserted paragraph.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EZY5V.html
	 */
	insertion?: null | InsertionProps;
	/**
	 * A property used to indicate when a paragraph has been deleted.
	 *
	 * If present, the containing paragraph element will appear as a track-change deleted paragraph.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_del_topic_ID0EMM3V.html
	 */
	deletion?: null | InsertionProps;
};

type IntermediateProps = Omit<TextProperties, 'change'> & {
	change?: {
		id: number;
		author?: string;
		date?: Date;
		node: Node | undefined;
	};
};

export function textPropertiesFromNode(node?: Node | null): TextProperties {
	if (!node) {
		return {};
	}

	// Check for a track changes movement element in our node.
	const nodeName = evaluateXPathToFirstNode<Element>(
		`./${QNS.w}*[self::${QNS.w}moveTo or self::${QNS.w}moveFrom]`,
		node
	);

	const props = node
		? evaluateXPathToMap<IntermediateProps>(
				`map {
			"style": ./${QNS.w}rStyle/@${QNS.w}val/string(),
			"color": ./${QNS.w}color/@${QNS.w}val/string(),
			"shading": ./${QNS.w}shd/docxml:ct-shd(.),
			"isUnderlined": ./${QNS.w}u/@${QNS.w}val/string(),
			"isBold": map {
				"simple": docxml:ct-on-off(./${QNS.w}b),
				"complex": docxml:ct-on-off(./${QNS.w}bCs)
			},
			"isItalic": map {
				"simple": docxml:ct-on-off(./${QNS.w}i),
				"complex": docxml:ct-on-off(./${QNS.w}iCs)
			},
			"isSmallCaps": docxml:ct-on-off(./${QNS.w}smallCaps),
			"isCaps": docxml:ct-on-off(./${QNS.w}caps),
			"verticalAlign": ./${QNS.w}vertAlign/@${QNS.w}val/string(),
			"language": ./${QNS.w}lang/@${QNS.w}val/string(),
			"fontSize": map {
				"simple": docxml:length(${QNS.w}sz/@${QNS.w}val, "hpt"),
				"complex": docxml:length(${QNS.w}szCs/@${QNS.w}val, "hpt")
			},
			"minimumKerningFontSize": docxml:length(${QNS.w}kern/@${QNS.w}val, "hpt"),
			"isStrike": docxml:ct-on-off(./${QNS.w}strike),
			"spacing": docxml:length(${QNS.w}spacing/@${QNS.w}val, 'twip'),
			"font": ./${QNS.w}rFonts/map {
				"cs": @${QNS.w}cs/string(),
				"ascii": @${QNS.w}ascii/string(),
				"hAnsi": @${QNS.w}hAnsi/string()
			},
			"moveTo": ./${QNS.w}moveTo/map {
				"id": @${QNS.w}id/number(), 
				"author": @${QNS.w}author/string(), 
				"date": @${QNS.w}date/string()
			}, 
			"moveFrom": ./${QNS.w}moveFrom/map { 
				"id": @${QNS.w}id/number(), 
				"author": @${QNS.w}author/string(), 
				"date": @${QNS.w}date/string()
			},
			"change": ./${QNS.w}rPrChange/map { 
				"id": @${QNS.w}id/number(), 
				"author": if (@${QNS.w}author/string()) then @${QNS.w}author/string() else (), 
				"date": @${QNS.w}date/string(), 
				"node": ./${QNS.w}rPr
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
				node,
				null,
				{ nodeName: nodeName ? nodeName.localName : null }
		  )
		: {};

	if (props.change) {
		props.change = {
			...props.change,
			date: props.change.date ? new Date(props.change.date) : undefined,
			author: props.change.author ? props.change.author : undefined,
			...textPropertiesFromNode(props.change.node),
			node: undefined,
		};
	} else {
		delete props.change;
	}

	if (props.insertion) {
		// Convert the date string to a Date object.
		props.insertion = {
			...props.insertion,
			date: props.insertion.date
				? new Date(props.insertion.date)
				: undefined,
			author: props.insertion.author ? props.insertion.author : undefined,
		};
	}

	if (props.deletion) {
		props.deletion = {
			...props.deletion,
			date: props.deletion.date
				? new Date(props.deletion.date)
				: undefined,
			author: props.deletion.author ? props.deletion.author : undefined,
		};
	}

	if (props.moveTo) {
		props.moveTo = {
			id: props.moveTo.id,
			author: props.moveTo.author ? props.moveTo.author : undefined,
			date: props.moveTo.date ? new Date(props.moveTo.date) : undefined,
		};
	}

	if (props.moveFrom) {
		props.moveFrom = {
			id: props.moveFrom.id,
			author: props.moveFrom.author ? props.moveFrom.author : undefined,
			date: props.moveFrom.date
				? new Date(props.moveFrom.date)
				: undefined,
		};
	}

	return props as TextProperties;
}

export async function textPropertiesToNode(
	data: TextProperties = {}
): Promise<Node | null> {
	if (
		!data.style &&
		!data.color &&
		!data.isUnderlined &&
		!data.language &&
		!data.isBold &&
		!data.verticalAlign &&
		!data.isItalic &&
		!data.isSmallCaps &&
		!data.isCaps &&
		!data.fontSize &&
		!data.isStrike &&
		!data.shading &&
		!data.font &&
		!data.moveTo &&
		!data.moveFrom &&
		!data.change &&
		!data.insertion &&
		!data.deletion
	) {
		return null;
	}

	return create(
		`element ${QNS.w}rPr {
			if ($style) then element ${QNS.w}rStyle {
				attribute ${QNS.w}val { $style }
			} else (),
			if ($color) then element ${QNS.w}color {
				attribute ${QNS.w}val { $color }
			} else (),
			if ($isUnderlined) then element ${QNS.w}u {
				attribute ${QNS.w}val { $isUnderlined }
			} else (),
			if ($isBold('simple')) then element ${QNS.w}b {} else (),
			if ($isBold('complex')) then element ${QNS.w}bCs {} else (),
			if ($isItalic('simple')) then element ${QNS.w}i {} else (),
			if ($isItalic('complex')) then element ${QNS.w}iCs {} else (),
			if ($isSmallCaps) then element ${QNS.w}smallCaps {} else (),
			if ($isCaps) then element ${QNS.w}caps {} else (),
			docxml:ct-shd(fn:QName("${NamespaceUri.w}", "shd"), $shading),
			if ($verticalAlign) then element ${QNS.w}vertAlign {
				attribute ${QNS.w}val { $verticalAlign }
			} else (),
			if ($language) then element ${QNS.w}lang {
				attribute ${QNS.w}val { $language }
			} else (),
			if (exists($fontSize('simple'))) then element ${QNS.w}sz {
				attribute ${QNS.w}val { $fontSize('simple')('hpt') }
			} else (),
			if (exists($fontSize('complex'))) then element ${QNS.w}szCs {
				attribute ${QNS.w}val { $fontSize('complex')('hpt') }
			} else (),
			if ($minimumKerningFontSize) then element ${QNS.w}kern {
				attribute ${QNS.w}val { $minimumKerningFontSize }
			} else (),
			if ($isStrike) then element ${QNS.w}strike {} else (),
			if ($spacing) then element ${QNS.w}spacing {
				attribute ${QNS.w}val { $spacing }
			} else (),
			if (exists($font)) then element ${QNS.w}rFonts {
				if (exists($font('cs'))) then attribute ${QNS.w}cs {
					$font('cs')
				} else (),
				if (exists($font('ascii'))) then attribute ${QNS.w}ascii {
					$font('ascii')
				} else (),
				if (exists($font('hAnsi'))) then attribute ${QNS.w}hAnsi {
					$font('hAnsi')
				} else ()
			} else (),
			if (exists($change)) then element ${QNS.w}rPrChange { 
				attribute ${QNS.w}id { $change('id') },
				if ($change('date')) then attribute ${QNS.w}date { $change('date') } else (),
				if ($change('author')) then attribute ${QNS.w}author { $change('author') } else (),
				$change('node')
			} else (),
			$moveTo, 
			$moveFrom,
			$insertion,
			$deletion
		}`,
		{
			style: data.style || null,
			color: data.color || null,
			isUnderlined:
				data.isUnderlined === true
					? 'single'
					: data.isUnderlined || null,
			language: data.language || null,
			shading: data.shading || null,
			isBold: explodeSimpleOrComplex(data.isBold || false),
			verticalAlign: data.verticalAlign || null,
			isItalic: explodeSimpleOrComplex(data.isItalic || false),
			isSmallCaps: data.isSmallCaps || false,
			isCaps: data.isCaps || false,
			fontSize: explodeSimpleOrComplex(data.fontSize || null),
			minimumKerningFontSize: data.minimumKerningFontSize
				? data.minimumKerningFontSize.hpt
				: null,
			isStrike: data.isStrike || false,
			spacing: data.spacing ? data.spacing.twip : null,
			font:
				typeof data.font === 'string'
					? {
							cs: data.font,
							ascii: data.font,
							hAnsi: data.font,
					  }
					: data.font
					? {
							cs: data.font.cs || null,
							ascii: data.font.ascii || null,
							hAnsi: data.font.hAnsi || null,
					  }
					: null,
			change: data.change
				? {
						id: data.change.id,
						author: data.change.author
							? data.change.author
							: undefined,
						date: data.change.date
							? new Date(data.change.date).toISOString()
							: undefined,
						node: await textPropertiesToNode(data.change),
				  }
				: null,
			/*
			 * Although the MoveTo, MoveFrom and Insertion components are used here and it can have children,
			 * since the move information is sent as properties rather than as an
			 * object, we can be sure that no more children will ever be created.
			 */
			moveTo: data.moveTo
				? await new MoveTo({
						...data.moveTo,
						date: data.moveTo.date
							? new Date(data.moveTo.date)
							: undefined,
				  }).toNode([])
				: null,

			moveFrom: data.moveFrom
				? await new MoveFrom({
						...data.moveFrom,
						date: data.moveFrom.date
							? new Date(data.moveFrom.date)
							: undefined,
				  }).toNode([])
				: null,
			insertion: data.insertion
				? await new Insertion(data.insertion).toNode([])
				: null,
			deletion: data.deletion
				? await new Deletion(data.deletion).toNode([])
				: null,
		}
	);
}

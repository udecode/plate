// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
//
// Add items to this list that would otherwise only be depended on as a type definition.

import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { type Length, cm, pt } from '../../../utilities/src/length.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import {
	evaluateXPathToBoolean,
	evaluateXPathToMap,
} from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link WatermarkText}.
 */
export type WatermarkTextChild = never;

/**
 * A type describing the props accepted by {@link WatermarkText}.
 *
 * The "style" option, which is part of both paragraph- and text properties, is always
 * set to the _paragraph_ style -- the _text_ style is ignored.
 */
export type WatermarkTextProps = {
	text: string;
	horizontalAlign?: 'left' | 'center' | 'right' | null;
	verticalAlign?: 'top' | 'center' | 'bottom' | null;
	minFontSize?: Length | null;
	boxWidth?: Length | null;
	boxHeight?: Length | null;

	/**
	 * The color of this text. Type as a hexidecimal code (`"ff0000"`) or a basic color name (`"red"`).
	 */
	color?: string | null;

	font?: string | null;

	/**
	 * The opacity of the watermark. Set to "1" for fully opaque, or to "0" for fully transparent (invisible), or
	 * anything in between.
	 */
	opacity?: number | null;

	isBold?: boolean | null;
	isItalic?: boolean | null;
};

/**
 *
 */
export class WatermarkText extends Component<
	WatermarkTextProps,
	WatermarkTextChild
> {
	public static override readonly children: string[] = [];
	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 *
	 *
	 *
	 *
	 */
	public override toNode(): Node {
		return create(
			`
			element ${QNS.w}p {
				element ${QNS.w}r {
					element ${QNS.w}pict {
						element ${QNS.v}shape {
							attribute type { "#_x0000_t136" },
							attribute style { concat(
								"position:absolute;",
								"margin-left:0;",
								"margin-top:0;",
								"width:", $boxWidth, "pt;",
								"height:", $boxHeight, "pt;",
								"z-index:-251651072;",
								"mso-wrap-edited:f;",
								"mso-width-percent:0;",
								"mso-height-percent:0;",
								"mso-position-horizontal:", $horizontalAlign, ";",
								"mso-position-horizontal-relative:page;",
								"mso-position-vertical:", $verticalAlign, ";",
								"mso-position-vertical-relative:page;",
								"mso-width-percent:0;",
								"mso-height-percent:0"
							) },
							attribute ${QNS.o}allowincell { "f" },
							attribute fillcolor { concat("#", $color) },
							attribute stroked { "f" },
							element ${QNS.v}fill {
								attribute opacity { $opacity }
							},
							element ${QNS.v}textpath {
								attribute style { concat(
									"font-family:&quot;",$font,"&quot;;",
									"font-size:", $minFontSize, "pt;",
									if ($isBold) then "font-weight:bold;" else (),
									if ($isItalic) then "font-style:italic" else ()
								) },
								attribute string { $text }
							}
						}
					}
				}
			}
			`,
			{
				text: this.props.text,
				horizontalAlign: this.props.horizontalAlign || 'center',
				verticalAlign: this.props.verticalAlign || 'center',
				boxWidth: (this.props.boxWidth || cm(21.6)).pt,
				boxHeight: (this.props.boxHeight || cm(23.9)).pt,
				minFontSize: (this.props.minFontSize || pt(10)).pt,
				color: this.props.color || '000000',
				font: this.props.font || 'Arial',
				opacity:
					this.props.opacity === null ||
					this.props.opacity === undefined
						? '100%'
						: this.props.opacity * 100 + '%',
				isBold: !!this.props.isBold,
				isItalic: !!this.props.isItalic,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		// This will possibly have false positives on "real" Word content
		return evaluateXPathToBoolean('self::w:p[./w:r/w:pict]', node);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): WatermarkText {
		const props = evaluateXPathToMap<WatermarkTextProps>(
			`map {

			}`,
			node
		);

		return new WatermarkText(props);
	}
}

registerComponent(WatermarkText);

import {
	type ComponentAncestor,
	Component,
} from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Symbol}.
 */
export type SymbolChild = never;

/**
 * A type describing the props accepted by {@link Symbol}.
 */
export type SymbolProps = {
	/**
	 * Specifies the typeface used for this character. For example, `"Symbol"` (default) or `"WingDings"`.
	 */
	font?: string;
	/**
	 * The character code to insert, as a number, for example `0xF0D5`
	 */
	code: number;
};

/**
 * A component that represents a special character from a different font.
 */
export class Symbol extends Component<SymbolProps, SymbolChild> {
	public static override readonly children: string[] = [];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}sym {
					if (exists($font)) then attribute ${QNS.w}font { $font } else (),
					if (exists($code)) then attribute ${QNS.w}char { $code } else ()
				}
			`,
			{
				font: this.props.font,
				code: this.props.code
					.toString(16)
					.padStart(4, '0')
					.toUpperCase(),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:sym';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	static override fromNode(node: Node): Symbol {
		const { font, char } = evaluateXPathToMap<{
			font: string;
			char: string;
		}>(
			`map {
				"font": ./@${QNS.w}font/string(),
				"char": ./@${QNS.w}char/string()
			}`,
			node
		);
		return new Symbol({
			font: font || 'Symbol',
			code: parseInt(char, 16) || 0,
		});
	}
}

registerComponent(Symbol);

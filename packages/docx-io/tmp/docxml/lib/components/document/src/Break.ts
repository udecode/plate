import {
	type ComponentAncestor,
	Component,
} from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Break}.
 */
export type BreakChild = never;

/**
 * A type describing the props accepted by {@link Break}.
 */
export type BreakProps = {
	/**
	 * Specifies the type of break, which determines the location for the following text.
	 * Defaults to `"textWrapping"`.
	 */
	type?: 'page' | 'column' | 'textWrapping' | null;
	/**
	 * Specifies the location where text restarts when the value of the type attribute is
	 * `"textWrapping"`.
	 */
	clear?: 'left' | 'right' | 'all' | 'none' | null;
};

/**
 * A component that represents a line break, page break or section break in a DOCX document. Place
 * this in one of the `<Text>` component.
 */
export class Break extends Component<BreakProps, BreakChild> {
	public static override readonly children: string[] = [];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}br {
					if (exists($type)) then attribute ${QNS.w}type { $type } else (),
					if (exists($clear)) then attribute ${QNS.w}clear { $clear } else ()
				}
			`,
			{
				type: this.props.type || null,
				clear: this.props.clear || null,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:br';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): Break {
		return new Break(
			evaluateXPathToMap<BreakProps>(
				`map {
					"type": ./@${QNS.w}type/string(),
					"clear": ./@${QNS.w}clear/string()
				}`,
				node
			)
		);
	}
}

registerComponent(Break);

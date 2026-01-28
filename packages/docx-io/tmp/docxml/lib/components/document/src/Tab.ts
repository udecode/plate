import {
	type ComponentAncestor,
	Component,
} from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/**
 * A type describing the components accepted as children of {@link Tab}.
 */
export type TabChild = never;

/**
 * A type describing the props accepted by {@link Tab}.
 */
export type TabProps = { [key: string]: never };

/**
 * A component that represents a tab space in a DOCX document. Place
 * this in the `<Text>` component.
 */
export class Tab extends Component<TabProps, TabChild> {
	public static override readonly children: string[] = [];

	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}tab {}
			`,
			{}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tab';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static override fromNode(_node: Node): Tab {
		return new Tab({});
	}
}

registerComponent(Tab);

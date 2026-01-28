import './Text.ts';

import type { Bookmark } from '../../../classes/src/Bookmarks.ts';
import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import { RelationshipType } from '../../../enums.ts';
import type { RelationshipsXml } from '../../../files/src/RelationshipsXml.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { Deletion } from '../../track-changes/src/Deletion.ts';
import type { Insertion } from '../../track-changes/src/Insertion.ts';
import type { Field } from './Field.ts';
import type { Text } from './Text.ts';

/**
 * A type describing the components accepted as children of {@link Hyperlink}.
 */
export type HyperlinkChild = Text | Field | Insertion | Deletion;

/**
 * A type describing the props accepted by {@link Hyperlink}.
 */
export type HyperlinkProps =
	| {
			anchor: string;
			bookmark?: never;
			url?: never;
			tooltip?: string;
	  }
	| {
			anchor?: never;
			bookmark: Bookmark;
			url?: never;
			tooltip?: string;
	  }
	| {
			anchor?: never;
			bookmark?: never;
			url: string;
			tooltip?: string;
	  };

/**
 * A component that represents a hyperlink to another part of the same document.
 */
export class Hyperlink extends Component<HyperlinkProps, HyperlinkChild> {
	public static override readonly children: string[] = [
		'Text',
		'Field',
		'Insertion',
		'Deletion',
	];

	public static override readonly mixed: boolean = false;

	#relationshipId: string | null = null;

	public override ensureRelationship(relationships: RelationshipsXml) {
		if (!this.props.url) {
			return;
		}
		this.#relationshipId = relationships.add(
			RelationshipType.hyperlink,
			this.props.url
		);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}hyperlink {
					if(exists($relationshipId)) then attribute ${QNS.r}id { $relationshipId } else (),
					if(exists($anchor)) then attribute ${QNS.w}anchor { $anchor } else (),
					if(exists($tooltip)) then attribute ${QNS.w}tooltip { $tooltip } else (),
					$children
				}
			`,
			{
				relationshipId: this.#relationshipId,
				anchor: this.props.bookmark?.name || this.props.anchor || null,
				tooltip: this.props.tooltip || null,
				children: await this.childrenToNode(ancestry),
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:hyperlink';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Hyperlink {
		const { children, ...props } = evaluateXPathToMap<
			HyperlinkProps & { children: Node[] }
		>(
			`map {
				"anchor": ./@${QNS.w}anchor/string(),
				"tooltip": ./@${QNS.w}tooltip/string(),
				"children": array{ ./(
					${QNS.w}r |
					${QNS.w}fldSimple |
					${QNS.w}ins |
					${QNS.w}del
				) }
			}`,
			node
		);
		return new Hyperlink(
			props,
			...createChildComponentsFromNodes<HyperlinkChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Hyperlink);

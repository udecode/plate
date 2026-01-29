// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Paragraph.ts';
import './Table.ts';

import {
	type AnyComponent,
	Component,
	type ComponentAncestor,
	type ComponentContext,
	type ComponentNodes,
	isComponentDefinition,
} from '../../../classes/src/Component.ts';
import {
	type SectionProperties,
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
} from '../../../properties/src/section-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { MoveFrom } from '../../track-changes/src/MoveFrom.ts';
import type { MoveTo } from '../../track-changes/src/MoveTo.ts';
import type { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import { Paragraph } from './Paragraph.ts';
import type { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Section}.
 */
export type SectionChild =
	| Paragraph
	| Table
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| MoveTo
	| MoveFrom;

export const sectionChildComponentNames = [
	'Table',
	'Paragraph',
	'BookmarkRangeStart',
	'BookmarkRangeEnd',
	'MoveTo',
	'MoveFrom',
];

/**
 * A type describing the props accepted by {@link Section}.
 */
export type SectionProps = SectionProperties;

/**
 * A component that represents a DOCX section, which could have its own page sizing options and so
 * on.
 *
 * In normal OOXML this information belongs at either the end of the document, or inside the
 * formatting options of the last paragraph belonging to that section. This component will smooth
 * that over in such a way that you can simply put `<Paragraph>` (etc.) inside `<Section>`.
 */
export class Section extends Component<SectionProps, SectionChild> {
	public static override readonly children: string[] =
		sectionChildComponentNames;
	public static override readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(
		ancestry: ComponentAncestor[]
	): Promise<ComponentNodes> {
		const parent = ancestry[0];
		if (!parent) {
			throw new Error(
				`Cannot serialize a section without parent context.`
			);
		}
		const siblings = isComponentDefinition(parent)
			? (parent as AnyComponent).children
			: await parent.children;
		const isLastSection = siblings[siblings.length - 1] === this;

		if (isLastSection) {
			return [
				...(await this.childrenToNode(ancestry)),
				sectionPropertiesToNode(this.props),
			];
		}

		const lastChild = this.children[this.children.length - 1];
		if (lastChild instanceof Paragraph) {
			lastChild.setSectionProperties(this.props);
		} else {
			const paragraph = new Paragraph({});
			paragraph.setSectionProperties(this.props);
			this.children.push(paragraph);
		}
		const nodes = await this.childrenToNode(ancestry);
		return nodes;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:sectPr';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Section {
		const { children } = evaluateXPathToMap<{ children: Node[] }>(
			`
				map {
					"children": array{
						if (parent::${QNS.w}body) then (
							./preceding-sibling::${QNS.w}*[
								not(./${QNS.w}pPr/${QNS.w}sectPr) and
								not(following-sibling::${QNS.w}p[./${QNS.w}pPr/${QNS.w}sectPr])
							]
						) else (
							let $nth := count(../../preceding-sibling::${QNS.w}p[./${QNS.w}pPr/${QNS.w}sectPr])
							return (
								../../preceding-sibling::${QNS.w}*[
									count(preceding-sibling::${QNS.w}p[./${QNS.w}pPr/${QNS.w}sectPr]) = $nth
								],
								../..
							)
						)
					}
				}
			`,
			node
		);

		return new Section(
			sectionPropertiesFromNode(node),
			...createChildComponentsFromNodes<SectionChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Section);

// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import '../../document/src/Text.ts';

import { Component } from '../../../classes/src/Component.ts';
import type { ChangeInformation } from '../../../utilities/src/changes.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';

export type MoveToRangeStartProps = ChangeInformation & {
	name: string;
};

export type MoveToRangeStartChild = never;

/**
 * A type for indicating the start of a range of content that was moved to one place from elsewhere.
 * In OOXML, these are self-closing tags.
 */
export class MoveToRangeStart extends Component<
	MoveToRangeStartProps,
	MoveToRangeStartChild
> {
	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override toNode(): Node {
		return create(
			`
				element ${QNS.w}moveToRangeStart {
					attribute ${QNS.w}id { $id }, 
					if ($date) then attribute ${QNS.w}date { $date } else (),
					if ($author) then attribute ${QNS.w}author { $author } else (),
					attribute ${QNS.w}name { $name }
				}
			`,
			{
				...this.props,
				author: this.props.author ? this.props.author : null,
				date: this.props.date ? this.props.date.toISOString() : null,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return (
			`Q{${(node as Element).namespaceURI}}` === QNS.w &&
			(node as Element).localName === `moveToRangeStart`
		);
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node): MoveToRangeStart {
		const { id, name, date, author } = evaluateXPathToMap<{
			id: number;
			name: string;
			date?: Date;
			author?: string;
		}>(
			`map { 
				"id": ./@${QNS.w}id/number(), 
				"name": ./@${QNS.w}name/string(),
				"date": ./@${QNS.w}date/string(),
				"author": ./@${QNS.w}author/string()
			}`,
			node
		);
		return new MoveToRangeStart({
			id: id,
			name: name,
			date: date ? new Date(date) : undefined,
			author: author ? author : undefined,
		});
	}
}

registerComponent(MoveToRangeStart);

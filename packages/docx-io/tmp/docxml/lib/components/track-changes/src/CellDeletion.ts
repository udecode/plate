import { Component } from '../../../classes/src/Component.ts';
import {
	type ChangeInformation,
	getChangeInformation,
} from '../../../utilities/src/changes.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/**
 * A type describing the props accepted by {@link CellDeletion}.
 */
export type CellDeletionProps = ChangeInformation;

/**
 * A component that represents a change-tracked for an cell deleted element.
 *
 * Additional documentation is here:
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_cellDel_topic_ID0E5IOV.html
 */
export class CellDeletion extends Component<CellDeletionProps, never> {
	public static override readonly children: string[] = [];
	public static override readonly mixed = false;

	public override toNode(): Node {
		return create(
			`
				let $attrs := [
					attribute ${QNS.w}id { $id },
					if ($author) then attribute ${QNS.w}author { $author } else (),
					if ($date) then attribute ${QNS.w}date { $date } else ()
				]
				return element ${QNS.w}cellDel { $attrs }
			`,
			{
				...this.props,
				date: this.props.date?.toISOString() ?? null,
				author: this.props.author ?? null,
			}
		);
	}

	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:cellDel';
	}
	static override fromNode(node: Node): CellDeletion {
		return new CellDeletion(getChangeInformation(node));
	}
}
registerComponent(CellDeletion);

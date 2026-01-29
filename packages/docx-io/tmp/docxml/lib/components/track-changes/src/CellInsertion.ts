import { Component } from '../../../classes/src/Component.ts';
import {
	type ChangeInformation,
	getChangeInformation,
} from '../../../utilities/src/changes.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';

/**
 * A type describing the props accepted by {@link CellInsertion}.
 */
export type CellInsertionProps = ChangeInformation;

/**
 * A component that represents a change-tracked for an cell inserted element.
 *
 * Additional documentation is here:
 * 	- https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_cellIns_topic_ID0EQ1OV.html
 */
export class CellInsertion extends Component<CellInsertionProps, never> {
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
				return element ${QNS.w}cellIns { $attrs }
			`,
			{
				...this.props,
				date: this.props.date?.toISOString() ?? null,
				author: this.props.author ?? null,
			}
		);
	}

	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:cellIns';
	}
	static override fromNode(node: Node): CellInsertion {
		return new CellInsertion(getChangeInformation(node));
	}
}
registerComponent(CellInsertion);

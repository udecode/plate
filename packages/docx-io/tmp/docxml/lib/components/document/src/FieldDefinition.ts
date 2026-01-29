import { Component } from '../../../classes/src/Component.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';

export type FieldDefinitionChild = never;

/**
 * In OOXML, Field Definitions are a fixed set of codes that exist as text inside a field instruction.
 *
 * This enum will be used to store their names as they are added. Here we can access them using the .FieldName
 * notation, and grab the corresponding string for use in our XQUF for generating the node.
 *
 */

export enum FieldNames {
	'HYPERLINK' = 'HYPERLINK',

	// Error is NOT a Field Code for MS Word, but rather a catch-all for when a user tries to use an invalid
	// code or set of options.
	'ERROR' = 'ERROR',
}

/**
 * In its text, each Field Definition has its name (e.g. 'HYPERLINK', 'DATE' or 'TOC'), and typically has a value.
 * In the case of hyperlinks, this value is a string specifying the link location ("http://www.google.com").
 *
 * Each Field Definition also has a set of "Switches". In OOXML these take the form of: "\b" (or any other letter), and
 * they specify certain behaviors of the Field. Many field definitions use the same set of letters, but to represent different
 * switches. "\o" may mean completely differnt things for HYPERLINK and TOC.
 *
 * Instead of relying on users to know this, we'll define them with human-readable property names.
 *
 * Ultimately, because this is a finite cascade of fixed options, we'll specify this with a large type with a lot of
 * prescribed paths for each possible field name we implement.
 *
 */

export type FieldDefinitionProps =
	| {
			name: FieldNames.HYPERLINK;
			value: string;
			fieldSwitches?: {
				newWindow?: boolean;
				locationInFile?: string;
				screenTip?: string;
				hyperlinkCoordinates: string;
				target: string;
			};
	  }
	| {
			name: FieldNames.ERROR;
			value: string | null;
	  };

export class FieldDefinition extends Component<
	FieldDefinitionProps,
	FieldDefinitionChild
> {
	public static override readonly children: never;

	public static override readonly mixed: boolean = false;

	public override toNode(): Node {
		return create(
			`
			element node { normalize-space(concat($name, " ", $value)), "\\*" }/text()
			`,
			{
				name: this.props.name,
				value: this.props.value,
			}
		);
	}

	static override fromNode(node: Node): FieldDefinition {
		const textContent = node.textContent?.split(' ');
		if (textContent) {
			return new FieldDefinition({
				name:
					textContent[0] in FieldNames
						? (textContent[0] as FieldNames)
						: FieldNames.ERROR,
				value: textContent[1] ?? null,
			});
		} else {
			return new FieldDefinition({ name: FieldNames.ERROR, value: null });
		}
	}
}

registerComponent(FieldDefinition);

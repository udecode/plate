import type { Archive } from '../../../classes/src/Archive.ts';
import { BinaryFile } from '../../../classes/src/BinaryFile.ts';
import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import { FileMime, RelationshipType } from '../../../enums.ts';
import type { RelationshipsXml } from '../../../files/src/RelationshipsXml.ts';
import { registerComponent } from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { extensionListUris } from '../../../utilities/src/drawingml-extensions.ts';
import {
	createRandomId,
	createUniqueNumericIdentifier,
} from '../../../utilities/src/identifiers.ts';
import { type Length, emu } from '../../../utilities/src/length.ts';
import { getMimeTypeForUint8Array } from '../../../utilities/src/mime-types.ts';
import { NamespaceUri, QNS } from '../../../utilities/src/namespaces.ts';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
} from '../../../utilities/src/xquery.ts';

/**
 * A type describing the components accepted as children of {@link Image}.
 */
export type ImageChild = never;

export type DataExtensions = {
	svg?: Promise<string>;
};

/**
 * A type describing the props accepted by {@link Image}.
 */
export type ImageProps = {
	data: Promise<Uint8Array>;
	mime?: FileMime;
	dataExtensions?: DataExtensions;
	title?: null | string;
	alt?: null | string;
	width: Length;
	height: Length;
};

/**
 * A component that represents an image in your DOCX document. You can create a new image by
 * passing any promise to an `Uint8Array` into the `data` prop, eg. get it from your file system
 * or from a web request.
 */
export class Image extends Component<ImageProps, ImageChild> {
	public static override readonly children: string[] = [];

	public static override readonly mixed: boolean = false;

	#meta: {
		location: string;
		mime: Promise<FileMime> | null;
		relationshipId: string | null;

		extensions: {
			svg?: {
				location: string;
				relationshipId: string | null;
			};
		};
	};
	get meta(): {
		readonly location: string;
		readonly mime: Promise<FileMime>;
		readonly relationshipId: string | null;
		readonly extensions: {
			readonly svg:
				| {
						readonly location: string;
						readonly relationshipId: string | null;
				  }
				| undefined;
		};
	} {
		const embedMeta = this.#meta;
		const props = this.props;

		return {
			get location() {
				return embedMeta.location;
			},
			get mime() {
				if (embedMeta.mime === null) {
					embedMeta.mime = new Promise((resolve) => {
						props.data.then((data) => {
							resolve(getMimeTypeForUint8Array(data));
						});
					});
				}
				return embedMeta.mime;
			},
			get relationshipId() {
				return embedMeta.relationshipId;
			},

			get extensions() {
				return {
					get svg() {
						const { svg } = embedMeta.extensions;
						if (!svg) {
							return undefined;
						}
						return {
							get location() {
								return svg.location;
							},
							get relationshipId() {
								return svg.relationshipId;
							},
						};
					},
				};
			},
		};
	}

	constructor(props: ImageProps, ...children: ImageChild[]) {
		super(props, ...children);

		this.#meta = {
			location: `word/media/${createRandomId('img')}`,
			mime: props.mime ? Promise.resolve(props.mime) : null,
			relationshipId: null,
			extensions: {},
		};

		if (props.dataExtensions) {
			const { svg } = props.dataExtensions;
			if (svg !== undefined) {
				this.#meta.extensions.svg = {
					location: `word/media/${createRandomId('svg')}`,
					relationshipId: null,
				};
			}
		}
	}

	/**
	 * An event hook with which this component can ensure that the correct relationship type is
	 * recorded to the relationship XML.
	 */
	public override async ensureRelationship(relationships: RelationshipsXml) {
		const { location, mime, extensions } = this.meta;

		this.#meta.relationshipId = relationships.add(
			RelationshipType.image,
			BinaryFile.fromData(this.props.data, location, await mime)
		);

		const { svg } = extensions;
		if (
			this.#meta.extensions.svg &&
			svg &&
			this.props.dataExtensions?.svg
		) {
			this.#meta.extensions.svg.relationshipId = relationships.add(
				RelationshipType.image,
				BinaryFile.fromData(
					new TextEncoder().encode(
						await this.props.dataExtensions.svg
					),
					svg.location,
					FileMime.svg
				)
			);
		}
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override toNode(_ancestry: ComponentAncestor[]): Node {
		if (!this.#meta.relationshipId) {
			throw new Error(
				'Cannot serialize an image outside the context of an Document'
			);
		}

		let extensionList: Node | null = null;
		const { svg } = this.meta.extensions;
		if (svg) {
			extensionList = create(
				`
					element ${QNS.a}extLst {
						element ${QNS.a}ext {
							attribute uri { $extLstUseLocalDpi },
							element ${QNS.a14}useLocalDpi {
								attribute val { "0" }
							}
						},
						element ${QNS.a}ext {
							attribute uri { $extLstSvg },
							element ${QNS.asvg}svgBlip {
								attribute ${QNS.r}embed { $relationshipId }
							}
						}
					}
				`,
				{
					relationshipId: svg.relationshipId,
					extLstUseLocalDpi: extensionListUris.useLocalDpi,
					extLstSvg: extensionListUris.svg,
				}
			);
		}

		return create(
			`
				element ${QNS.w}drawing {
					element ${QNS.wp}inline {
						element ${QNS.wp}extent {
							attribute cx { $width },
							attribute cy { $height }
						},
						element ${QNS.wp}docPr {
							attribute id { $identifier },
							attribute name { $name },
							attribute descr { $desc }
						},
						element ${QNS.wp}cNvGraphicFramePr {
							element ${QNS.a}graphicFrameLocks {
								attribute noChangeAspect { "1" }
							}
						},

						(: nb: _Must_ be prefixed with "a" or MS Word will refuse to open :)
						element ${QNS.a}graphic {
							element ${QNS.a}graphicData {
								attribute uri { "${NamespaceUri.pic}"},
								element ${QNS.pic}pic {
									element ${QNS.pic}nvPicPr {
										element ${QNS.pic}cNvPr {
											attribute id { $identifier },
											attribute name { $name },
											attribute descr { $desc }
										},
										element ${QNS.pic}cNvPicPr {}
									},
									element ${QNS.pic}blipFill {
										element ${QNS.a}blip {
											attribute ${QNS.r}embed { $relationshipId },
											attribute cstate { "print" },
											$extensionList
										},
										element ${QNS.a}stretch {
											element ${QNS.a}fillRect {}
										}
									},
									element ${QNS.pic}spPr {
										element ${QNS.a}xfrm {
											element ${QNS.a}off {
												attribute x { "0" },
												attribute y { "0" }
											},
											element ${QNS.a}ext {
												attribute cx { $width },
												attribute cy { $height }
											}
										},
										element ${QNS.a}prstGeom {
											attribute prst { "rect" },
											element ${QNS.a}avLst {}
										}
									}
								}
							}
						}
					}
				}
			`,
			{
				identifier: createUniqueNumericIdentifier(),
				relationshipId: this.#meta.relationshipId,
				width: Math.round(this.props.width.emu),
				height: Math.round(this.props.height.emu),
				name: this.props.title || '',
				desc: this.props.alt || '',
				extensionList,
			}
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:drawing';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(
		node: Node,
		{ archive, relationships }: ComponentContext
	): Image {
		// Important nodes
		const inlineNode = evaluateXPathToFirstNode(`./${QNS.wp}inline`, node);
		const picNode = evaluateXPathToFirstNode(
			`./${QNS.a}graphic/${QNS.a}graphicData/${QNS.pic}pic`,
			inlineNode
		);

		const title = evaluateXPathToString(
			`./${QNS.wp}docPr/@name/string()`,
			inlineNode
		);

		const width = emu(
			evaluateXPathToNumber(`./${QNS.wp}extent/@cx/number()`, inlineNode)
		);
		const height = emu(
			evaluateXPathToNumber(`./${QNS.wp}extent/@cy/number()`, inlineNode)
		);

		if (relationships === null) {
			// Our simplified images are always expected to reference a relationship ID
			throw new Error(
				'Failed to load image. The image is referencing a relationship ID but RelationhipsXml is null in the context.'
			);
		}

		const blipNode = evaluateXPathToFirstNode(
			`${QNS.pic}blipFill/${QNS.a}blip`,
			picNode
		);
		if (blipNode === null) {
			throw new Error(
				'Failed to load image. No blip found inside a blipFill.'
			);
		}
		const { main, svg } = extractDataFromBlipNode(
			archive,
			relationships,
			blipNode
		);

		const dataExtensions: DataExtensions = {};
		if (svg) {
			dataExtensions.svg = svg.data;
		}

		const image = new Image({
			data: main.data,
			dataExtensions,
			title,
			width,
			height,
		});
		image.#meta.location = main.location;
		if (svg) {
			const { svg: svgMeta } = image.#meta.extensions;
			// We are certain that if we pass `dataExtensions` with `svg` in it
			// `Image` construtor makes it so image.#meta.extensions has `svg` too.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			svgMeta!.location = svg.location;
		}
		return image;
	}
}

registerComponent(Image);

type ExtractedBlipNodeData = {
	main: {
		data: Promise<Uint8Array>;
		location: string;
	};
	svg?: {
		data: Promise<string>;
		location: string;
	};
};

function extractDataFromBlipNode(
	archive: Archive,
	relationships: RelationshipsXml,
	blipNode: Node
): ExtractedBlipNodeData {
	const blipEmbedRel = evaluateXPathToString(
		`@${QNS.r}embed/string()`,
		blipNode
	);
	const location = relationships.getTarget(blipEmbedRel);
	const data = archive.readBinary(location);

	const allLocationsAndData: ExtractedBlipNodeData = {
		main: {
			data,
			location,
		},
	};

	const blipextLst = evaluateXPathToNodes(`./extLst/*`, blipNode);
	blipextLst.forEach((node) => {
		if (node.nodeType !== 1) {
			return;
		}
		const element = node as Element;
		const extensionUri = element.getAttribute('uri');

		if (extensionUri === extensionListUris.svg) {
			const extensionRel = element.children[0].getAttributeNS(
				NamespaceUri.r,
				'embed'
			);
			if (extensionRel === null) {
				throw new Error(
					'Failed to load image SVG extension. SVG extension URI found in extLst but its node does not follow the known format.'
				);
			}
			const location = relationships.getTarget(extensionRel);
			const data = archive.readText(location);

			allLocationsAndData.svg = {
				location,
				data,
			};

			return;
		}

		// Implement other similar blip extensions here
		// if (extensionUri === "some other rui") { }
	});

	return allLocationsAndData;
}

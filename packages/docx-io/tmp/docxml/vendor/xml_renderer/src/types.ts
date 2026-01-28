import type fontoxpath from 'fontoxpath';

/**
 * When creating an element rendering rule, an XPath test is matched to a Component. The rule
 * component is expected to return null or a AstComponent -- which represents a node in the DOCX
 * AST.
 *
 * In the following example, the arrow function declaration is a _rule_ component that returns the
 * `Bold` _docx_ component:
 *
 * ```ts
 * app.match('self::bold', ({ traverse }) => (
 *   <Text bold>{traverse()}</Text>
 * ));
 * ```
 */
export type Component<
	OutputGeneric,
	PropsGeneric extends { [key: string]: unknown } | undefined
> = (props: Props<OutputGeneric, PropsGeneric>) => OutputGeneric;

/**
 * The single function that calls a given {@link Component} with {@link Props} to get its output.
 *
 * For example:
 *
 * ```ts
 * const factory = (component, props) => component ? component(props) : null;
 * ```
 */
export type Factory<
	// The render function or "component" that is gonna be given the props
	OutputGeneric,
	PropsGeneric extends { [key: string]: unknown } | undefined,
	MetadataGeneric = Component<OutputGeneric, PropsGeneric>
> = (
	component: MetadataGeneric | undefined,
	props: Props<OutputGeneric, PropsGeneric>
) => OutputGeneric | null;

/**
 * The props/parameters passed into a rule component by the renderer.
 */
export type Props<
	OutputGeneric,
	PropsGeneric extends { [key: string]: unknown } | undefined
> = {
	/**
	 * The XML node that is being rendered with this rule. Can be any type of node, and it matches
	 * the XPath test with which this rule is associated.
	 *
	 * Having the node available is useful in case you want to use other fontoxpath functions to
	 * query it further.
	 */
	node: Node;

	/**
	 * A function to kick off the rendering of arbitrary (child? sibling? who cares) XML nodes.
	 * Accepts an XPath query, or defaults to "all child nodes". Intended to be easily usable within
	 * a JSX template.
	 *
	 * The context node for any query ran through `traverse()` is the same as the
	 * {@link Props.node node} prop.
	 *
	 * For example:
	 *
	 * ```ts
	 * app.match('self::bold', ({ traverse }) => (
	 *   <Text bold>{traverse()}</Text>
	 * ));
	 * ```
	 *
	 * Or with an XPath query:
	 *
	 * ```ts
	 * app.match('self::chapter', ({ traverse }) => (
	 *   <Section>
	 *     <Header>{traverse('./p[1]')}</Header>
	 *     {traverse('./node()[not(./p[1])]')}
	 *   </Section>
	 * ));
	 * ```
	 */
	traverse: (query?: string) => OutputGeneric[];
} & (PropsGeneric extends undefined ? { [key: string]: never } : PropsGeneric);

export type Options = {
	/**
	 * An object implementing the few fontoxpath methods that xml-renderer uses internally. Allows you
	 * to override the XPath functions with your own, or with fontoxpath curried with additional options,
	 * namespaces, etc.
	 */
	fontoxpathFacade: Pick<
		typeof fontoxpath,
		| 'evaluateXPathToBoolean'
		| 'evaluateXPathToFirstNode'
		| 'evaluateXPathToNodes'
		| 'compareSpecificity'
	>;
};

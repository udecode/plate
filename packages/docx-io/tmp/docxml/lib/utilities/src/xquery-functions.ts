import fontoxpath from 'fontoxpath';

import { convert } from './length.ts';
import { QNS } from './namespaces.ts';

export const DOCXML_NS_URI = 'https://github.com/fontoxml/docxml';

fontoxpath.registerCustomXPathFunction(
	{ namespaceURI: DOCXML_NS_URI, localName: 'length' },
	['xs:float?', 'xs:string'],
	'map(*)?',
	(_facade, value, unit) => (value === null ? null : convert(value, unit))
);

fontoxpath.registerXQueryModule(`
	module namespace docxml = "${DOCXML_NS_URI}";

	declare %public function docxml:cell-column($cell) as xs:double {
		sum(
			$cell/preceding-sibling::${QNS.w}tc/(
				if (./${QNS.w}tcPr/${QNS.w}gridSpan)
					then number(./${QNS.w}tcPr/${QNS.w}gridSpan/@${QNS.w}val)
					else 1
			)
		)
	};

	declare %public function docxml:spans-cell-column($cell, $column) as xs:boolean {
		let $start := docxml:cell-column($cell)
		let $gridSpan := if ($cell/${QNS.w}tcPr/${QNS.w}gridSpan)
			then number($cell/${QNS.w}tcPr/${QNS.w}gridSpan/@${QNS.w}val)
			else 1

		return boolean(($column >= $start) and ($column < ($start + $gridSpan)))
	};


	(:
		Correlates with the ST_OnOff simple type. In short,
		- If $val is "on", "true" or "1", value is TRUE
		- Any other value means FALSE
	:)
	declare %public function docxml:st-on-off($val) as xs:boolean {
		$val = ("on", "true", "1")
	};

	(:
		Correlates with the CT_OnOff complex type. In short;
		- If the element does not exist, value is FALSE
		- If the element exists but has no @val, defaults to value TRUE
		- If the element @val is set to "on", "true" or "1", value is TRUE
		- Any other value of @val means FALSE

		Also works with CT_BooleanProperty.
	:)
	declare %public function docxml:ct-on-off($val) as xs:boolean {
		if (not(exists($val)))
			then false()
			else if (not($val/@${QNS.w}val))
				then true()
				else docxml:st-on-off($val/@${QNS.w}val)
	};

	(:
		Correlates with the CT_Shd complex type. Returns a map of TypeScript shape "Shading".
	:)
	declare %public function docxml:ct-shd($val) as map(*)? {
		$val/map {
			"foreground": ./@${QNS.w}color/string(),
			"background": ./@${QNS.w}fill/string(),
			"pattern": ./@${QNS.w}val/string()
		}
	};

	(: @TODO Test this function :)
	declare %public function docxml:ct-shd($name as xs:QName, $data as map(*)?) {
		if (exists($data)) then element {$name} {
			if (exists($data('foreground'))) then attribute ${QNS.w}color { $data('foreground') } else (),
			if (exists($data('background'))) then attribute ${QNS.w}fill { $data('background') } else (),
			if (exists($data('pattern'))) then attribute ${QNS.w}val { $data('pattern') } else ()
		} else ()
	};

	(:
		Correlates with the CT_Border complex type.

		@TODO Test this function
	:)
	declare %public function docxml:ct-border($val) as map(*)? {
		$val/map {
			"type": ./@${QNS.w}val/string(),
			"width": docxml:length(@${QNS.w}sz, 'opt'),
			"spacing": if (exists(./@${QNS.w}space))
				then ./@${QNS.w}space/number()
				else (),
			"color": ./@${QNS.w}color/string()
		}
	};

	(:
		Creates a new element of the CT_Border complex type.

		@TODO Test this function
	:)
	declare %public function docxml:ct-border($name as xs:QName, $data as map(*)?) {
		if (exists($data)) then element {$name} {
			if ($data('type')) then attribute ${QNS.w}val { $data('type') } else (),
			if (exists($data('width'))) then attribute ${QNS.w}sz { $data('width')('opt') } else (),
			if (exists($data('spacing'))) then attribute ${QNS.w}space { $data('spacing') } else (),
			if ($data('color')) then attribute ${QNS.w}color { $data('color') } else ()
		} else ()
	};
`);

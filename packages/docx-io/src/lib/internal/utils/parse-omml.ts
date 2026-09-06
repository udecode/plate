import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { fragment } from 'xmlbuilder2';

import namespaces from '../namespaces';

const ommlRootNames = new Set(['oMath', 'oMathPara']);
const allowedAttributeNamespaces = new Set([
  namespaces.m,
  'http://www.w3.org/2000/xmlns/',
  'http://www.w3.org/XML/1998/namespace',
]);

type XmlNode = XMLBuilder['node'];

type XmlAttribute = {
  namespaceURI: string | null;
};

type XmlElement = XmlNode & {
  attributes: ArrayLike<XmlAttribute>;
  localName: string;
  namespaceURI: string | null;
  removeAttributeNode: (attribute: XmlAttribute) => unknown;
};

const isXmlElement = (node: XmlNode): node is XmlElement => node.nodeType === 1;

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const sanitizeOmmlElement = (node: XmlElement) => {
  Array.from(node.attributes).forEach((attribute) => {
    if (!allowedAttributeNamespaces.has(attribute.namespaceURI ?? '')) {
      node.removeAttributeNode(attribute);
    }
  });

  Array.from(node.childNodes)
    .filter(isDefined)
    .forEach((child) => {
      if (!isXmlElement(child)) return;

      if (child.namespaceURI !== namespaces.m) {
        node.removeChild(child);
        return;
      }

      sanitizeOmmlElement(child);
    });
};

export const parseOmml = (value: string): XMLBuilder => {
  const omml = fragment().ele(value);
  const { node } = omml;
  const siblings = Array.from(node.parentNode?.childNodes ?? []).filter(
    isDefined
  );
  const elementSiblings = siblings.filter(isXmlElement);
  const hasUnexpectedSibling = siblings.some(
    (sibling) => sibling.nodeType !== 1 && sibling.textContent?.trim()
  );

  if (
    !isXmlElement(node) ||
    node.namespaceURI !== namespaces.m ||
    !ommlRootNames.has(node.localName ?? '') ||
    elementSiblings.length !== 1 ||
    elementSiblings[0] !== node ||
    hasUnexpectedSibling
  ) {
    throw new Error('Invalid OMML');
  }

  sanitizeOmmlElement(node);

  return omml;
};

import { describe, expect, it } from 'bun:test';

import {
  hasExplicitTopTypeBridge,
  isAnyConditionalFallback,
  isJsxIntrinsicElementsDictionary,
  isNamedTypeAlias,
  isTypeAssertionAnnotation,
  shouldSuppressUnsafeDictionary,
} from './anti-slop-plugin.mjs';

const anyType = { type: 'TSAnyKeyword' };
const identifier = { type: 'Identifier' };
const typeReference = { type: 'TSTypeReference' };
const unknownType = { type: 'TSUnknownKeyword' };

const assertion = (expression, typeAnnotation) => ({
  expression,
  type: 'TSAsExpression',
  typeAnnotation,
});

describe('Plate Anti-Slop policy', () => {
  it('preserves explicit top-type bridges but rejects accidental chains', () => {
    expect(
      hasExplicitTopTypeBridge(
        assertion(assertion(identifier, unknownType), typeReference)
      )
    ).toBe(true);
    expect(
      hasExplicitTopTypeBridge(
        assertion(assertion(identifier, typeReference), typeReference)
      )
    ).toBe(false);
    expect(
      hasExplicitTopTypeBridge(
        assertion(assertion(identifier, typeReference), unknownType)
      )
    ).toBe(false);
    expect(
      hasExplicitTopTypeBridge(
        assertion(
          assertion(assertion(identifier, typeReference), unknownType),
          typeReference
        )
      )
    ).toBe(false);
    expect(
      hasExplicitTopTypeBridge(
        assertion(assertion(identifier, anyType), typeReference)
      )
    ).toBe(true);
  });

  it('distinguishes local assertion types from declared dictionary contracts', () => {
    const assertedType = { parent: null, type: 'TSTypeReference' };
    const cast = assertion(identifier, assertedType);
    assertedType.parent = cast;

    expect(isTypeAssertionAnnotation(assertedType)).toBe(true);

    const declaredType = {
      parent: { parent: null, type: 'TSTypeAliasDeclaration' },
      type: 'TSTypeReference',
    };

    expect(isTypeAssertionAnnotation(declaredType)).toBe(false);
  });

  it('preserves explicit any propagation and JSX host declarations', () => {
    const fallback = { parent: null, type: 'TSTypeReference' };
    const conditional = {
      checkType: {
        type: 'TSTypeReference',
        typeName: { name: 'IsAny', type: 'Identifier' },
      },
      parent: null,
      trueType: fallback,
      type: 'TSConditionalType',
    };
    fallback.parent = conditional;

    expect(isAnyConditionalFallback(fallback)).toBe(true);

    const dictionary = { parent: null, type: 'TSIndexSignature' };
    const intrinsicElements = {
      id: { name: 'IntrinsicElements' },
      parent: { type: 'Program' },
      type: 'TSInterfaceDeclaration',
    };
    dictionary.parent = intrinsicElements;

    expect(isJsxIntrinsicElementsDictionary(dictionary)).toBe(true);
  });

  it('preserves safe unknown dictionaries and the explicit AnyObject escape hatch', () => {
    const declaredUnknown = {
      parent: { parent: null, type: 'TSTypeAliasDeclaration' },
      type: 'TSUnknownKeyword',
    };

    expect(
      shouldSuppressUnsafeDictionary({
        data: { value: 'unknown' },
        node: declaredUnknown,
      })
    ).toBe(true);

    const uncheckedValue = { parent: null, type: 'TSAnyKeyword' };
    const alias = {
      id: { name: 'AnyObject' },
      parent: { type: 'Program' },
      type: 'TSTypeAliasDeclaration',
    };
    uncheckedValue.parent = alias;

    expect(isNamedTypeAlias(uncheckedValue, 'AnyObject')).toBe(true);
    expect(
      shouldSuppressUnsafeDictionary({
        data: { value: 'any' },
        node: uncheckedValue,
      })
    ).toBe(true);
  });
});

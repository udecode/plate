import { BoldPlugin } from '@udecode/plate-basic-marks';

import { createPlateEditor } from '../../../../react/editor/withPlate';
import { createSlatePlugin } from '../../../plugin';
import { ParagraphPlugin } from '../../paragraph';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

const node = () => ({ type: ParagraphPlugin.key });

describe('when element is p and validNodeName is P', () => {
  it('should be p type', () => {
    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            getNode: node,
            isElement: true,
            rules: [
              {
                validNodeName: 'P',
              },
            ],
          },
          type: ParagraphPlugin.key,
        }),
        { element: document.createElement('p') }
      )?.node
    ).toEqual(node());
  });
});

describe('when element is p, validAttribute', () => {
  it('returns p type with an existing attribute', () => {
    const element = document.createElement('p');
    element.setAttribute('title', '');

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            getNode: node,
            isElement: true,
            rules: [
              {
                validAttribute: { title: '' },
              },
            ],
          },
          type: ParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).toEqual(node());
  });

  it('doesnt return p type with an unset attribute', () => {
    const element = document.createElement('p');

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            getNode: node,
            isElement: true,
            rules: [
              {
                validAttribute: { title: '' },
              },
            ],
          },
          type: ParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).not.toEqual(node());
  });
});

describe('when element is p with color and rule style is different', () => {
  it('should not be p type', () => {
    const element = document.createElement('p');
    element.style.color = '#FF0000';

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            getNode: node,
            isElement: true,
            rules: [
              {
                validStyle: {
                  color: '#333',
                },
              },
            ],
          },
          type: ParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).not.toEqual(node());
  });
});

describe('when element is p with same style color than rule', () => {
  it('should be', () => {
    const element = document.createElement('p');
    element.style.color = 'rgb(255, 0, 0)';

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            getNode: node,
            isElement: true,
            rules: [
              {
                validStyle: {
                  color: 'rgb(255, 0, 0)',
                },
              },
            ],
          },
          type: ParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).toEqual(node());
  });
});

describe('when element has style color and rule style color is *', () => {
  it('should be p type', () => {
    const element = document.createElement('p');
    element.style.color = '#FF0000';

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            getNode: node,
            isElement: true,
            rules: [
              {
                validStyle: {
                  color: '*',
                },
              },
            ],
          },
          type: ParagraphPlugin.key,
        }),
        { element }
      )?.node
    ).toEqual(node());
  });
});

describe('when element is strong and validNodeName is strong', () => {
  it('should be', () => {
    const el = document.createElement('strong');
    el.textContent = 'hello';

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        createSlatePlugin({
          deserializeHtml: {
            rules: [
              {
                validNodeName: 'STRONG',
              },
            ],
          },
          isLeaf: true,
          type: BoldPlugin.key,
        }),
        { deserializeLeaf: true, element: el }
      )?.node
    ).toEqual({ [BoldPlugin.key]: true });
  });
});

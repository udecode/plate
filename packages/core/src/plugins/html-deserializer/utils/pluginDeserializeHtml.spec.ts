import { MARK_BOLD } from '../../../../../nodes/basic-marks/src/createBoldPlugin';
import { ELEMENT_PARAGRAPH } from '../../../../../nodes/paragraph/src/createParagraphPlugin';
import { createPlateEditor } from '../../../utils/createPlateEditor';
import { mockPlugin } from '../../../utils/mockPlugin';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

const node = () => ({ type: ELEMENT_PARAGRAPH });

describe('when element is p and validNodeName is P', () => {
  it('should be p type', () => {
    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            rules: [
              {
                validNodeName: 'P',
              },
            ],
          },
        }),
        { element: document.createElement('p') }
      )?.node
    ).toEqual(node());
  });
});

describe('when element is p, validAttribute', () => {
  it('returns p type with an existing attribute', () => {
    const element = document.createElement('p');
    element.setAttribute('tabIndex', '0');

    expect(
      pluginDeserializeHtml(
        createPlateEditor(),
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            rules: [
              {
                validAttribute: { tabIndex: '0' },
              },
            ],
          },
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
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            rules: [
              {
                validAttribute: { tabIndex: '0' },
              },
            ],
          },
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
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            rules: [
              {
                validStyle: {
                  color: '#333',
                },
              },
            ],
          },
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
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            rules: [
              {
                validStyle: {
                  color: 'rgb(255, 0, 0)',
                },
              },
            ],
          },
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
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            rules: [
              {
                validStyle: {
                  color: '*',
                },
              },
            ],
          },
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
        mockPlugin({
          isLeaf: true,
          type: MARK_BOLD,
          deserializeHtml: {
            rules: [
              {
                validNodeName: 'STRONG',
              },
            ],
          },
        }),
        { element: el, deserializeLeaf: true }
      )?.node
    ).toEqual({ [MARK_BOLD]: true });
  });
});

import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/createBoldPlugin';
import { mockPlugin } from '../../../utils/mockPlugin';
import { pluginDeserializeHtml } from './pluginDeserializeHtml';

const node = () => ({ type: ELEMENT_PARAGRAPH });

describe('when element is p and validNodeName is P', () => {
  it('should be p type', () => {
    expect(
      pluginDeserializeHtml(
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            validNodeName: 'P',
          },
        }),
        { element: document.createElement('p') }
      )?.node
    ).toEqual(node());
  });
});

describe('when element is p with color and rule style is different', () => {
  it('should not be p type', () => {
    const element = document.createElement('p');
    element.style.color = '#FF0000';

    expect(
      pluginDeserializeHtml(
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            validStyle: {
              color: '#333',
            },
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
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            validStyle: {
              color: 'rgb(255, 0, 0)',
            },
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
        mockPlugin({
          type: ELEMENT_PARAGRAPH,
          deserializeHtml: {
            isElement: true,
            getNode: node,
            validStyle: {
              color: '*',
            },
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
        mockPlugin({
          isLeaf: true,
          type: MARK_BOLD,
          deserializeHtml: {
            validNodeName: 'STRONG',
          },
        }),
        { element: el, deserializeLeaf: true }
      )?.node
    ).toEqual({ [MARK_BOLD]: true });
  });
});

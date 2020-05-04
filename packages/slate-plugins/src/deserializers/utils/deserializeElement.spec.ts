import { ParagraphPlugin } from 'elements/paragraph';
import { deserializeElement } from './deserializeElement';

describe('when deserializeElement', () => {
  describe('when ParagraphPlugin, element is p', () => {
    it('should return a paragraph element', () => {
      expect(
        deserializeElement({
          plugins: [ParagraphPlugin({ typeP: 'p' })],
          el: document.createElement('p'),
          children: [{ text: 'test' }],
        })
      ).toEqual({
        type: 'p',
        children: [{ text: 'test' }],
      });
    });
  });

  describe('when ParagraphPlugin, element is div with data-slate-type p', () => {
    it('should return a paragraph element', () => {
      const el = document.createElement('div');
      el.setAttribute('data-slate-type', 'p');

      expect(
        deserializeElement({
          plugins: [ParagraphPlugin({ typeP: 'p' })],
          el,
          children: [{ text: 'test' }],
        })
      ).toEqual({
        type: 'p',
        children: [{ text: 'test' }],
      });
    });
  });

  describe('when ParagraphPlugin, element is div, type is div', () => {
    it('should be undefined', () => {
      const el = document.createElement('div');
      el.setAttribute('data-slate-type', 'div');

      expect(
        deserializeElement({
          plugins: [ParagraphPlugin({ typeP: 'p' })],
          el: document.createElement('div'),
          children: [{ text: 'test' }],
        })
      ).toBeUndefined();
    });
  });
});

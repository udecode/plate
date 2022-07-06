import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { usePlateId } from '../../atoms/plateIdAtom';
import { PlateProvider } from './PlateProvider';

describe('PlateProvider', () => {
  describe('when id prop is not defined', () => {
    it('usePlateId should return "main"', async () => {
      const wrapper = ({ children }: any) => (
        <PlateProvider>{children}</PlateProvider>
      );
      const { result } = renderHook(() => usePlateId(), {
        wrapper,
      });

      expect(result.current).toBe('main');
    });
  });

  describe('when id prop is defined', () => {
    it('usePlateId should return that id', async () => {
      const wrapper = ({ children }: any) => (
        <PlateProvider id="test">{children}</PlateProvider>
      );
      const { result } = renderHook(() => usePlateId(), {
        wrapper,
      });

      expect(result.current).toBe('test');
    });
  });
});

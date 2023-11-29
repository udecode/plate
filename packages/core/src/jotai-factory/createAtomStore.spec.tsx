import React, { ReactNode, useState } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { useSetAtom } from 'jotai';

import { createAtomStore } from './createAtomStore';

describe('createAtomStore', () => {
  describe('single provider', () => {
    type MyTestStoreValue = {
      name: string;
      age: number;
    };

    const INITIAL_NAME = 'John';
    const INITIAL_AGE = 42;

    const initialTestStoreValue: MyTestStoreValue = {
      name: INITIAL_NAME,
      age: INITIAL_AGE,
    };

    const { useMyTestStoreStore, MyTestStoreProvider, myTestStoreStore } =
      createAtomStore(initialTestStoreValue, { name: 'myTestStore' as const });

    const ReadOnlyConsumer = () => {
      const [name] = useMyTestStoreStore().use.name();
      const [age] = useMyTestStoreStore().use.age();

      return (
        <div>
          <span>{name}</span>
          <span>{age}</span>
        </div>
      );
    };

    const WRITE_ONLY_CONSUMER_AGE = 99;

    const WriteOnlyConsumer = () => {
      const setAge = useMyTestStoreStore().set.age();

      return (
        <button type="button" onClick={() => setAge(WRITE_ONLY_CONSUMER_AGE)}>
          consumerSetAge
        </button>
      );
    };

    const MUTABLE_PROVIDER_INITIAL_AGE = 19;
    const MUTABLE_PROVIDER_NEW_AGE = 20;

    const MutableProvider = ({ children }: { children: ReactNode }) => {
      const [age, setAge] = useState(MUTABLE_PROVIDER_INITIAL_AGE);

      return (
        <>
          <MyTestStoreProvider age={age}>{children}</MyTestStoreProvider>

          <button
            type="button"
            onClick={() => setAge(MUTABLE_PROVIDER_NEW_AGE)}
          >
            providerSetAge
          </button>
        </>
      );
    };

    beforeEach(() => {
      renderHook(() => useSetAtom(myTestStoreStore.atom.name)(INITIAL_NAME));
      renderHook(() => useSetAtom(myTestStoreStore.atom.age)(INITIAL_AGE));
    });

    it('passes default values from provider to consumer', () => {
      const { getByText } = render(
        <MyTestStoreProvider>
          <ReadOnlyConsumer />
        </MyTestStoreProvider>
      );

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(INITIAL_AGE)).toBeInTheDocument();
    });

    it('passes non-default values from provider to consumer', () => {
      const { getByText } = render(
        <MyTestStoreProvider name="Jane" age={94}>
          <ReadOnlyConsumer />
        </MyTestStoreProvider>
      );

      expect(getByText('Jane')).toBeInTheDocument();
      expect(getByText('94')).toBeInTheDocument();
    });

    it('propagates updates from provider to consumer', () => {
      const { getByText } = render(
        <MutableProvider>
          <ReadOnlyConsumer />
        </MutableProvider>
      );

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(MUTABLE_PROVIDER_INITIAL_AGE)).toBeInTheDocument();

      act(() => getByText('providerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(MUTABLE_PROVIDER_NEW_AGE)).toBeInTheDocument();
    });

    it('propagates updates between consumers', () => {
      const { getByText } = render(
        <MyTestStoreProvider>
          <ReadOnlyConsumer />
          <WriteOnlyConsumer />
        </MyTestStoreProvider>
      );

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(INITIAL_AGE)).toBeInTheDocument();

      act(() => getByText('consumerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(WRITE_ONLY_CONSUMER_AGE)).toBeInTheDocument();
    });

    it('prefers the most recent update', () => {
      const { getByText } = render(
        <MutableProvider>
          <ReadOnlyConsumer />
          <WriteOnlyConsumer />
        </MutableProvider>
      );

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(MUTABLE_PROVIDER_INITIAL_AGE)).toBeInTheDocument();

      act(() => getByText('consumerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(WRITE_ONLY_CONSUMER_AGE)).toBeInTheDocument();

      act(() => getByText('providerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(MUTABLE_PROVIDER_NEW_AGE)).toBeInTheDocument();

      act(() => getByText('consumerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(WRITE_ONLY_CONSUMER_AGE)).toBeInTheDocument();
    });

    it('works without a provider', () => {
      const { getByText } = render(
        <>
          <ReadOnlyConsumer />
          <WriteOnlyConsumer />
        </>
      );

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(INITIAL_AGE)).toBeInTheDocument();

      act(() => getByText('consumerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(WRITE_ONLY_CONSUMER_AGE)).toBeInTheDocument();
    });

    it('works adjacent to a provider', () => {
      const { getByText } = render(
        <>
          <ReadOnlyConsumer />
          <MyTestStoreProvider name="Jane" age={94}>
            <WriteOnlyConsumer />
          </MyTestStoreProvider>
        </>
      );

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(INITIAL_AGE)).toBeInTheDocument();

      act(() => getByText('consumerSetAge').click());

      expect(getByText(INITIAL_NAME)).toBeInTheDocument();
      expect(getByText(INITIAL_AGE)).toBeInTheDocument();
    });
  });

  describe('scoped providers', () => {
    type MyScopedTestStoreValue = { age: number | null };

    const initialScopedTestStoreValue: MyScopedTestStoreValue = {
      age: null,
    };

    const { useMyScopedTestStoreStore, MyScopedTestStoreProvider } =
      createAtomStore(initialScopedTestStoreValue, {
        name: 'myScopedTestStore' as const,
      });

    const ReadOnlyConsumer = ({ scope }: { scope: string }) => {
      const [age] = useMyScopedTestStoreStore().use.age({ scope });

      return (
        <div>
          <span>{JSON.stringify(age)}</span>
        </div>
      );
    };

    const ReadOnlyConsumerWithScopeShorthand = ({
      scope,
    }: {
      scope: string;
    }) => {
      const [age] = useMyScopedTestStoreStore(scope).use.age();

      return (
        <div>
          <span>{JSON.stringify(age)}</span>
        </div>
      );
    };

    it('returns default value when no provider is present', () => {
      const { getByText } = render(<ReadOnlyConsumer scope="scope1" />);

      expect(getByText('null')).toBeInTheDocument();
    });

    it('returns value of first ancestor when scope matches no provider', () => {
      const { getByText } = render(
        <MyScopedTestStoreProvider scope="scope1" age={1}>
          <MyScopedTestStoreProvider scope="scope2" age={2}>
            <ReadOnlyConsumer scope="scope3" />
          </MyScopedTestStoreProvider>
        </MyScopedTestStoreProvider>
      );

      expect(getByText('2')).toBeInTheDocument();
    });

    it('returns value of first matching ancestor provider', () => {
      const { getByText } = render(
        <MyScopedTestStoreProvider scope="scope1" age={1}>
          <MyScopedTestStoreProvider scope="scope2" age={2}>
            <MyScopedTestStoreProvider scope="scope3" age={3}>
              <MyScopedTestStoreProvider scope="scope2" age={4}>
                <MyScopedTestStoreProvider scope="scope2" age={5} />
                <MyScopedTestStoreProvider scope="scope1" age={6}>
                  <ReadOnlyConsumer scope="scope2" />
                </MyScopedTestStoreProvider>
                <MyScopedTestStoreProvider scope="scope2" age={7} />
              </MyScopedTestStoreProvider>
            </MyScopedTestStoreProvider>
          </MyScopedTestStoreProvider>
        </MyScopedTestStoreProvider>
      );

      expect(getByText('4')).toBeInTheDocument();
    });

    it('allows shorthand to specify scope', () => {
      const { getByText } = render(
        <MyScopedTestStoreProvider scope="scope1" age={1}>
          <MyScopedTestStoreProvider scope="scope2" age={2}>
            <MyScopedTestStoreProvider scope="scope3" age={3}>
              <MyScopedTestStoreProvider scope="scope2" age={4}>
                <MyScopedTestStoreProvider scope="scope2" age={5} />
                <MyScopedTestStoreProvider scope="scope1" age={6}>
                  <ReadOnlyConsumerWithScopeShorthand scope="scope2" />
                </MyScopedTestStoreProvider>
                <MyScopedTestStoreProvider scope="scope2" age={7} />
              </MyScopedTestStoreProvider>
            </MyScopedTestStoreProvider>
          </MyScopedTestStoreProvider>
        </MyScopedTestStoreProvider>
      );

      expect(getByText('4')).toBeInTheDocument();
    });
  });

  describe('multiple unrelated stores', () => {
    type MyFirstTestStoreValue = { name: string };
    type MySecondTestStoreValue = { age: number };

    const initialFirstTestStoreValue: MyFirstTestStoreValue = {
      name: 'My name',
    };

    const initialSecondTestStoreValue: MySecondTestStoreValue = {
      age: 72,
    };

    const { useMyFirstTestStoreStore, MyFirstTestStoreProvider } =
      createAtomStore(initialFirstTestStoreValue, {
        name: 'myFirstTestStore' as const,
      });

    const { useMySecondTestStoreStore, MySecondTestStoreProvider } =
      createAtomStore(initialSecondTestStoreValue, {
        name: 'mySecondTestStore' as const,
      });

    const FirstReadOnlyConsumer = () => {
      const [name] = useMyFirstTestStoreStore().use.name();

      return (
        <div>
          <span>{name}</span>
        </div>
      );
    };

    const SecondReadOnlyConsumer = () => {
      const [age] = useMySecondTestStoreStore().use.age();

      return (
        <div>
          <span>{age}</span>
        </div>
      );
    };

    it('returns the value for the correct store', () => {
      const { getByText } = render(
        <MyFirstTestStoreProvider name="Jane" scope="firstScope">
          <MySecondTestStoreProvider age={98} scope="secondScope">
            <FirstReadOnlyConsumer />
            <SecondReadOnlyConsumer />
          </MySecondTestStoreProvider>
        </MyFirstTestStoreProvider>
      );

      expect(getByText('Jane')).toBeInTheDocument();
      expect(getByText('98')).toBeInTheDocument();
    });
  });
});

'use client';

import { IS_APPLE } from 'platejs';
import { MentionInputPlugin, MentionPlugin } from 'platejs/mention/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useMounted } from '@/registry/hooks/use-mounted';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

export function MentionElement(
  props: PlateElementProps<typeof MentionPlugin> & {
    prefix?: string;
  }
) {
  const { element } = props;
  const selected = useElementSelected();
  const focused = useEditorFocused();
  const mounted = useMounted();
  const readOnly = useEditorReadOnly();
  const label = element.label ?? element.ref;

  return (
    <PlateElement
      {...props}
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm',
        inlineSuggestionVariants(),
        !readOnly && 'cursor-pointer',
        selected && focused && 'ring-2 ring-ring',
        element.children[0].bold === true && 'font-bold',
        element.children[0].italic === true && 'italic',
        element.children[0].underline === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        contentEditable: false,
        'data-plite-value': label,
        draggable: true,
      }}
    >
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <>
          {props.children}
          {props.prefix}
          {label}
        </>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <>
          {props.prefix}
          {label}
          {props.children}
        </>
      )}
    </PlateElement>
  );
}

export function MentionInputElement(
  props: PlateElementProps<typeof MentionInputPlugin>
) {
  const { editor, element } = props;
  const [search, setSearch] = React.useState('');

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox
        value={search}
        element={element}
        setValue={setSearch}
        showTrigger={false}
        trigger="@"
      >
        <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm ring-ring focus-within:ring-2">
          <InlineComboboxInput />
        </span>

        <InlineComboboxContent className="my-1.5">
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          <InlineComboboxGroup>
            {MENTIONABLES.map((item) => (
              <InlineComboboxItem
                key={item.ref}
                value={item.label}
                onClick={() => {
                  editor
                    .plugin(MentionPlugin)
                    .update.insert({ label: item.label, ref: item.ref });
                }}
              >
                {item.label}
              </InlineComboboxItem>
            ))}
          </InlineComboboxGroup>
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}

const MENTIONABLES = [
  { ref: '0', label: 'Aayla Secura' },
  { ref: '1', label: 'Adi Gallia' },
  {
    ref: '2',
    label: 'Admiral Dodd Rancit',
  },
  {
    ref: '3',
    label: 'Admiral Firmus Piett',
  },
  {
    ref: '4',
    label: 'Admiral Gial Ackbar',
  },
  { ref: '5', label: 'Admiral Ozzel' },
  { ref: '6', label: 'Admiral Raddus' },
  {
    ref: '7',
    label: 'Admiral Terrinald Screed',
  },
  { ref: '8', label: 'Admiral Trench' },
  {
    ref: '9',
    label: 'Admiral U.O. Statura',
  },
  { ref: '10', label: 'Agen Kolar' },
  { ref: '11', label: 'Agent Kallus' },
  {
    ref: '12',
    label: 'Aiolin and Morit Astarte',
  },
  { ref: '13', label: 'Aks Moe' },
  { ref: '14', label: 'Almec' },
  { ref: '15', label: 'Alton Kastle' },
  { ref: '16', label: 'Amee' },
  { ref: '17', label: 'AP-5' },
  { ref: '18', label: 'Armitage Hux' },
  { ref: '19', label: 'Artoo' },
  { ref: '20', label: 'Arvel Crynyd' },
  { ref: '21', label: 'Asajj Ventress' },
  { ref: '22', label: 'Aurra Sing' },
  { ref: '23', label: 'AZI-3' },
  { ref: '24', label: 'Bala-Tik' },
  { ref: '25', label: 'Barada' },
  { ref: '26', label: 'Bargwill Tomder' },
  { ref: '27', label: 'Baron Papanoida' },
  { ref: '28', label: 'Barriss Offee' },
  { ref: '29', label: 'Baze Malbus' },
  { ref: '30', label: 'Bazine Netal' },
  { ref: '31', label: 'BB-8' },
  { ref: '32', label: 'BB-9E' },
  { ref: '33', label: 'Ben Quadinaros' },
  { ref: '34', label: 'Berch Teller' },
  { ref: '35', label: 'Beru Lars' },
  { ref: '36', label: 'Bib Fortuna' },
  {
    ref: '37',
    label: 'Biggs Darklighter',
  },
  { ref: '38', label: 'Black Krrsantan' },
  { ref: '39', label: 'Bo-Katan Kryze' },
  { ref: '40', label: 'Boba Fett' },
  { ref: '41', label: 'Bobbajo' },
  { ref: '42', label: 'Bodhi Rook' },
  { ref: '43', label: 'Borvo the Hutt' },
  { ref: '44', label: 'Boss Nass' },
  { ref: '45', label: 'Bossk' },
  {
    ref: '46',
    label: 'Breha Antilles-Organa',
  },
  { ref: '47', label: 'Bren Derlin' },
  { ref: '48', label: 'Brendol Hux' },
  { ref: '49', label: 'BT-1' },
];

export const MentionKit = [
  MentionPlugin.configure({
    component: MentionElement,
    initialState: {
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  }),
  MentionInputPlugin.configure({ component: MentionInputElement }),
];

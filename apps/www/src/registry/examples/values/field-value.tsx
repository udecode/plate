/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';
import type { FieldKind, FieldSettings } from 'platejs/field';

jsx;

export const field = (
  fieldId: string,
  kind: FieldKind,
  label: string,
  role: string,
  settings?: Partial<FieldSettings>
) => ({
  children: [{ text: '' }],
  fieldId,
  kind,
  label,
  role,
  type: 'field',
  ...settings,
});

export const fieldValue: Value = (
  <fragment>
    <hheading level={2}>Lease</hheading>
    <hp>
      Prepared by{' '}
      <hmention label="Ada Lovelace" ref="ada">
        <htext />
      </hmention>{' '}
      on{' '}
      <hdate value="2026-11-20">
        <htext />
      </hdate>{' '}
      for{' '}
      {field('tenant', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
        required: true,
      })}
      .
    </hp>
    <hp>
      The landlord,{' '}
      {field('landlord', 'text', 'Landlord', 'landlord', {
        name: 'landlord_name',
        required: true,
      })}
      , lets the home from{' '}
      {field('start', 'date', 'Start date', 'landlord', { name: 'start_date' })}
      .
    </hp>
    <htable>
      <htr>
        <hth>
          <hp>Fee</hp>
        </hth>
        <hth>
          <hp>Amount</hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>Monthly rent</hp>
        </htd>
        <htd>
          <hp>
            {field('rent', 'number', 'Rent', 'landlord', {
              name: 'rent',
              required: true,
            })}
          </hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>Deposit</hp>
        </htd>
        <htd>
          <hp>
            {field('deposit', 'number', 'Deposit', 'landlord', {
              name: 'deposit',
            })}
          </hp>
        </htd>
      </htr>
    </htable>
    <hp>
      Pets allowed?{' '}
      {field('pets', 'choice', 'Pets allowed', 'landlord', {
        name: 'pets_allowed',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        required: true,
      })}{' '}
      Pet name:{' '}
      {field('pet-name', 'text', 'Pet name', 'tenant', {
        condition: { ref: 'pets', test: 'equals', value: 'yes' },
        name: 'pet_name',
        required: true,
      })}
    </hp>
    <hp>
      {field('rules', 'checkbox', 'House rules', 'tenant', {
        name: 'house_rules',
        required: true,
      })}{' '}
      I accept the house rules.
    </hp>
    <hp>
      Signed by the landlord{' '}
      {field('landlord-signature', 'signature', 'Signature', 'landlord', {
        name: 'landlord_signature',
      })}{' '}
      and the tenant{' '}
      {field('tenant-again', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
        required: true,
      })}{' '}
      {field('tenant-signature', 'signature', 'Signature', 'tenant', {
        name: 'tenant_signature',
      })}
    </hp>
  </fragment>
);

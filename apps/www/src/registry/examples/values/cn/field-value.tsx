/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

import { field } from '@/registry/examples/values/field-value';

jsx;

export const fieldValue: Value = (
  <fragment>
    <hheading level={2}>租赁合同</hheading>
    <hp>
      由{' '}
      <hmention label="Ada Lovelace" ref="ada">
        <htext />
      </hmention>{' '}
      于{' '}
      <hdate value="2026-11-20">
        <htext />
      </hdate>{' '}
      为{' '}
      {field('tenant', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
        required: true,
      })}{' '}
      拟定。
    </hp>
    <hp>
      房东{' '}
      {field('landlord', 'text', '房东姓名', '房东', {
        name: 'landlord_name',
        required: true,
      })}{' '}
      自 {field('start', 'date', '起租日期', '房东', { name: 'start_date' })}{' '}
      起出租该房屋。
    </hp>
    <htable>
      <htr>
        <hth>
          <hp>费用</hp>
        </hth>
        <hth>
          <hp>金额</hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>月租</hp>
        </htd>
        <htd>
          <hp>
            {field('rent', 'number', '月租', '房东', {
              name: 'rent',
              required: true,
            })}
          </hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>押金</hp>
        </htd>
        <htd>
          <hp>
            {field('deposit', 'number', '押金', '房东', { name: 'deposit' })}
          </hp>
        </htd>
      </htr>
    </htable>
    <hp>
      是否允许养宠物？
      {field('pets', 'choice', '允许养宠物', '房东', {
        name: 'pets_allowed',
        options: [
          { label: '是', value: 'yes' },
          { label: '否', value: 'no' },
        ],
        required: true,
      })}{' '}
      宠物名字：
      {field('pet-name', 'text', '宠物名字', '租客', {
        condition: { ref: 'pets', test: 'equals', value: 'yes' },
        name: 'pet_name',
        required: true,
      })}
    </hp>
    <hp>
      {field('rules', 'checkbox', '房屋守则', '租客', {
        name: 'house_rules',
        required: true,
      })}{' '}
      我已阅读并接受房屋守则。
    </hp>
    <hp>
      房东签名{' '}
      {field('landlord-signature', 'signature', '签名', '房东', {
        name: 'landlord_signature',
      })}{' '}
      租客{' '}
      {field('tenant-again', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
        required: true,
      })}{' '}
      签名{' '}
      {field('tenant-signature', 'signature', '签名', '租客', {
        name: 'tenant_signature',
      })}
    </hp>
  </fragment>
);

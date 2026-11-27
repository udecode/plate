'use client';

import type { Value } from 'platejs';
import type { FieldKind, FieldSettings } from 'platejs/field';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { useLocale } from '@/hooks/useLocale';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FieldKit } from '@/registry/components/editor/field';
import { FieldToolbarButton } from '@/registry/components/editor/field-toolbar-button';
import { TableKit } from '@/registry/components/editor/table';
import { Toolbar } from '@/registry/components/editor/toolbar';

const field = (
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

const petName = {
  condition: {
    all: [
      { ref: 'pets', test: 'equals', value: 'yes' },
      { ref: 'has-pet', test: 'equals', value: true },
    ],
  },
  name: 'pet_name',
  required: true,
} as const;

const gasMeter = {
  condition: { ref: 'utilities', test: 'includes', value: 'gas' },
  name: 'gas_meter',
  required: true,
} as const;

const enValue: Value = [
  { children: [{ text: 'Lease' }], level: 2, type: 'heading' },
  {
    children: [
      { text: 'This lease between ' },
      field('landlord', 'text', 'Landlord', 'landlord', {
        name: 'landlord_name',
        required: true,
      }),
      { text: ' and ' },
      field('tenant', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
        required: true,
      }),
      { text: ' starts on ' },
      field('start', 'date', 'Start date', 'landlord', { name: 'start_date' }),
      { text: ' at a monthly rent of ' },
      field('rent', 'number', 'Rent', 'landlord', {
        name: 'rent',
        required: true,
      }),
      { text: '.' },
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Pets allowed? ' },
      field('pets', 'choice', 'Pets allowed', 'landlord', {
        name: 'pets_allowed',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
        required: true,
      }),
      { text: ' ' },
      field('has-pet', 'checkbox', 'I have a pet', 'tenant', {
        name: 'has_pet',
      }),
      { text: ' Pet name: ' },
      field('pet-name', 'text', 'Pet name', 'tenant', petName),
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Utilities paid by the tenant: ' },
      field('utilities', 'multiple', 'Utilities', 'tenant', {
        max: 2,
        name: 'utilities',
        options: [
          { label: 'Water', value: 'water' },
          { label: 'Gas', value: 'gas' },
          { label: 'Electric', value: 'electric' },
        ],
        required: true,
      }),
      { text: ' Gas meter number: ' },
      field('gas-meter', 'text', 'Gas meter number', 'tenant', gasMeter),
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: 'Signed by the tenant ' },
      field('tenant-again', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
        required: true,
      }),
      { text: ' ' },
      field('tenant-signature', 'signature', 'Signature', 'tenant', {
        name: 'tenant_signature',
      }),
    ],
    type: 'paragraph',
  },
];

const cnValue: Value = [
  { children: [{ text: '租赁合同' }], level: 2, type: 'heading' },
  {
    children: [
      { text: '本合同由房东 ' },
      field('landlord', 'text', '房东姓名', '房东', {
        name: 'landlord_name',
        required: true,
      }),
      { text: ' 与租客 ' },
      field('tenant', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
        required: true,
      }),
      { text: ' 签订，自 ' },
      field('start', 'date', '起租日期', '房东', { name: 'start_date' }),
      { text: ' 起生效，月租 ' },
      field('rent', 'number', '月租', '房东', {
        name: 'rent',
        required: true,
      }),
      { text: '。' },
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: '是否允许养宠物？' },
      field('pets', 'choice', '允许养宠物', '房东', {
        name: 'pets_allowed',
        options: [
          { label: '是', value: 'yes' },
          { label: '否', value: 'no' },
        ],
        required: true,
      }),
      { text: ' ' },
      field('has-pet', 'checkbox', '我有宠物', '租客', { name: 'has_pet' }),
      { text: ' 宠物名字：' },
      field('pet-name', 'text', '宠物名字', '租客', petName),
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: '由租客支付的水电燃气：' },
      field('utilities', 'multiple', '水电燃气', '租客', {
        max: 2,
        name: 'utilities',
        options: [
          { label: '水', value: 'water' },
          { label: '燃气', value: 'gas' },
          { label: '电', value: 'electric' },
        ],
        required: true,
      }),
      { text: ' 燃气表号：' },
      field('gas-meter', 'text', '燃气表号', '租客', gasMeter),
    ],
    type: 'paragraph',
  },
  {
    children: [
      { text: '租客签字 ' },
      field('tenant-again', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
        required: true,
      }),
      { text: ' ' },
      field('tenant-signature', 'signature', '签名', '租客', {
        name: 'tenant_signature',
      }),
    ],
    type: 'paragraph',
  },
];

export default function FieldAuthoringDemo() {
  const initialValue = useLocale() === 'cn' ? cnValue : enValue;
  const editor = useCreateEditor({
    plugins: [...BasicBlocksKit, ...BasicMarksKit, ...TableKit, ...FieldKit],
    initialValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer className="h-[420px]">
        <Toolbar className="border-b px-3 py-1">
          <FieldToolbarButton />
        </Toolbar>
        <Editor
          aria-label="Lease template"
          className="h-auto ps-[clamp(24px,8%,48px)] pe-13 pb-16"
          variant="demo"
        />
      </EditorContainer>
    </EditorRoot>
  );
}

'use client';

import type { Value } from 'platejs';
import type { FieldKind, FieldSettings } from 'platejs/field';
import { FieldPlugin } from 'platejs/field/react';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useModelEditor,
  usePluginStore,
} from 'platejs/react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLocale } from '@/hooks/useLocale';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  closeFieldSettings,
  FieldElement,
} from '@/registry/components/editor/field';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { Toolbar } from '@/registry/components/editor/toolbar';

const AUTHOR = 'author';

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

const enValue: Value = [
  { children: [{ text: 'Lease' }], level: 2, type: 'heading' },
  {
    children: [
      { text: 'The landlord, ' },
      field('landlord', 'text', 'Landlord', 'landlord', {
        name: 'landlord_name',
        required: true,
        value: 'Grace Hopper',
      }),
      { text: ', lets the home to ' },
      field('tenant', 'text', 'Tenant name', 'tenant', {
        name: 'tenant_name',
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
        value: 'yes',
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
      field('rules', 'checkbox', 'House rules', 'tenant', {
        name: 'house_rules',
        required: true,
      }),
      { text: ' I accept the house rules.' },
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
      { text: '房东 ' },
      field('landlord', 'text', '房东姓名', '房东', {
        name: 'landlord_name',
        required: true,
        value: '王明',
      }),
      { text: ' 将房屋出租给 ' },
      field('tenant', 'text', '租客姓名', '租客', {
        name: 'tenant_name',
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
        value: 'yes',
      }),
      { text: ' ' },
      field('has-pet', 'checkbox', '我有宠物', '租客', {
        name: 'has_pet',
      }),
      { text: ' 宠物名字：' },
      field('pet-name', 'text', '宠物名字', '租客', petName),
    ],
    type: 'paragraph',
  },
  {
    children: [
      field('rules', 'checkbox', '房屋守则', '租客', {
        name: 'house_rules',
        required: true,
      }),
      { text: ' 我已阅读并接受房屋守则。' },
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

const leases = {
  cn: {
    authorHint:
      '正在编辑模板。可以修改正文，点击字段可修改类型、角色、名称和显示条件。',
    fillHint: (role: string) =>
      `正在以${role}身份填写。只有${role}的字段可以打开；正文和其他角色的字段保持锁定，撤销只撤回${role}的答案。`,
    labels: {
      [AUTHOR]: '编辑模板',
      房东: '以房东身份填写',
      租客: '以租客身份填写',
    },
    tenant: '租客',
    value: cnValue,
  },
  en: {
    authorHint:
      'Authoring. Edit the text, or click any chip to change its kind, role, name or Show when.',
    fillHint: (role: string) =>
      `Filling as ${role}. Only ${role} chips open; document text and other roles stay locked, and undo reverts only ${role} answers.`,
    labels: {
      [AUTHOR]: 'Author',
      landlord: 'Fill as landlord',
      tenant: 'Fill as tenant',
    },
    tenant: 'tenant',
    value: enValue,
  },
};

export default function FieldFillDemo() {
  const lease = useLocale() === 'cn' ? leases.cn : leases.en;
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...BasicMarksKit,
      FieldPlugin.configure({
        component: FieldElement,
        initialState: { fillRole: lease.tenant },
      }),
    ],
    initialValue: lease.value,
  });

  return (
    <EditorRoot editor={editor}>
      <FieldFillContent />
    </EditorRoot>
  );
}

function FieldFillContent() {
  const lease = useLocale() === 'cn' ? leases.cn : leases.en;
  const editor = useEditor();
  const modelEditor = useModelEditor();
  const fillRole = usePluginStore(FieldPlugin, 'fillRole') ?? null;

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          aria-label="Fill role"
          onValueChange={(value) => {
            if (!value) return;
            if (!closeFieldSettings(modelEditor)) return;

            editor
              .plugin(FieldPlugin)
              .store.set({ fillRole: value === AUTHOR ? null : value });
          }}
          size="sm"
          type="single"
          value={fillRole ?? AUTHOR}
          variant="outline"
        >
          {Object.entries(lease.labels).map(([role, label]) => (
            <ToggleGroupItem key={role} value={role}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Toolbar>
          <UndoToolbarButton />
          <RedoToolbarButton />
        </Toolbar>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {fillRole === null ? lease.authorHint : lease.fillHint(fillRole)}
      </p>
      <EditorContainer className="h-[300px] rounded-md border">
        <Editor
          aria-label="Lease to fill"
          className="h-auto ps-[clamp(24px,8%,48px)] pe-13 pb-8"
          variant="demo"
        />
      </EditorContainer>
    </div>
  );
}

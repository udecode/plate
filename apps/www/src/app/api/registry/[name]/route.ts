import { NextResponse } from 'next/server';
import { z } from 'zod';

import { highlightFiles } from '@/lib/highlight-code';
import { getRegistryItem } from '@/lib/registry';

const ParamsSchema = z.object({
  name: z.string().min(1, 'Name parameter is required'),
});

export async function GET(_: Request, { params }: any) {
  try {
    const { name } = ParamsSchema.parse({ name: params.name });

    const item = await getRegistryItem(name);

    if (!item?.files) {
      return NextResponse.json({ files: null });
    }

    const highlightedFiles = await highlightFiles(item.files);

    return NextResponse.json({
      files: highlightedFiles,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Failed to get registry files:', error.issues[0].message);

      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Failed to get registry files:', error);

    return NextResponse.json(
      { error: 'Failed to get registry files' },
      { status: 500 }
    );
  }
}

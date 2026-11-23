import {
  getPlateCreatePreset,
  readPlateCreateConfig,
} from '@/lib/plate-create';
import { getPlateCreateTheme } from '@/lib/plate-create-theme';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const config = readPlateCreateConfig({
    base: searchParams.get('base'),
    preset: searchParams.get('preset'),
  });

  try {
    return Response.json(
      await getPlateCreateTheme(config.base, getPlateCreatePreset(config)),
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } }
    );
  } catch (error) {
    return Response.json(
      {
        error: `shadcn's theme service did not answer: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 502 }
    );
  }
}

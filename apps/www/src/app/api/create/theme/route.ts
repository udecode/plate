import {
  getPlateCreatePreset,
  readPlateCreateConfig,
} from '@/lib/plate-create';
import { getCachedPlateCreateTheme } from '@/lib/plate-create-theme';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const config = readPlateCreateConfig({
    base: searchParams.get('base'),
    preset: searchParams.get('preset'),
  });

  try {
    return Response.json(
      await getCachedPlateCreateTheme(
        config.base,
        getPlateCreatePreset(config)
      ),
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } }
    );
  } catch (error) {
    return Response.json(
      {
        error: `Could not load this preset's theme from shadcn: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 502 }
    );
  }
}

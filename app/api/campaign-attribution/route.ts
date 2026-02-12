import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.userId ?? null;
}

// GET /api/campaign-attribution?deviceId=xxx — fetch attribution data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const userId = await getUserId(request);

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'userId or deviceId required' }, { status: 400 });
    }

    const record = await prisma.campaignAttribution.findFirst({
      where: userId ? { userId } : { deviceId: deviceId! },
    });

    if (!record) {
      return NextResponse.json({ firstTouch: null, lastTouch: null, touchpoints: [] });
    }

    return NextResponse.json({
      firstTouch: record.firstTouch,
      lastTouch: record.lastTouch,
      touchpoints: record.touchpoints,
    });
  } catch (error) {
    console.error('Error fetching campaign attribution:', error);
    return NextResponse.json({ error: 'Failed to fetch attribution' }, { status: 500 });
  }
}

// PUT /api/campaign-attribution — upsert attribution data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, lastTouch, touchpoints, firstTouch: incomingFirstTouch } = body as {
      deviceId: string;
      firstTouch?: Record<string, unknown> | null;
      lastTouch?: Record<string, unknown> | null;
      touchpoints?: unknown[];
    };

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    const userId = await getUserId(request);

    // Check if record already exists to preserve firstTouch
    const existing = await prisma.campaignAttribution.findUnique({ where: { deviceId } });

    await prisma.campaignAttribution.upsert({
      where: { deviceId },
      create: {
        deviceId,
        userId: userId ?? null,
        firstTouch: incomingFirstTouch ?? undefined,
        lastTouch: lastTouch ?? undefined,
        touchpoints: touchpoints ?? [],
      },
      update: {
        // firstTouch: only set if not already stored (server-side "never overwrite" protection)
        ...(incomingFirstTouch && !existing?.firstTouch
          ? { firstTouch: incomingFirstTouch }
          : {}),
        ...(lastTouch !== undefined ? { lastTouch } : {}),
        ...(touchpoints !== undefined ? { touchpoints } : {}),
        ...(userId && { userId }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving campaign attribution:', error);
    return NextResponse.json({ error: 'Failed to save attribution' }, { status: 500 });
  }
}

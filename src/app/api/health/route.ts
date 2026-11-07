// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // キャッシュを防ぐ

export async function GET() {
  try {
    // 必要に応じてDBや外部APIの疎通確認を追加
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: String(error) },
      { status: 503 }
    );
  }
}

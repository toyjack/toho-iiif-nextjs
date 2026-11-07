// app/api/health/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // キャッシュを防ぐ

// 必要に応じてDBや外部APIの疎通確認を追加（失敗時は 503 を返す）
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

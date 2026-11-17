import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireUser(['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  const startTime = Date.now();
  try {
    // 1. Testa conectividade com banco SQLite/Prisma
    const [userCount, motoCount, leadCount, saleCount] = await Promise.all([
      prisma.user.count(),
      prisma.motorcycle.count(),
      prisma.lead.count(),
      prisma.sale.count(),
    ]);

    const latencyMs = Date.now() - startTime;
    const memory = process.memoryUsage();

    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: 'CONNECTED',
        latencyMs: `${latencyMs}ms`,
        counts: {
          users: userCount,
          motorcycles: motoCount,
          leads: leadCount,
          sales: saleCount,
        },
      },
      system: {
        nodeVersion: process.version,
        memoryRssMb: (memory.rss / (1024 * 1024)).toFixed(2),
        memoryHeapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(2),
      },
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0-PROD-CANDIDATE',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        error: error.message || 'Falha na checagem de saúde do sistema',
      },
      { status: 503 }
    );
  }
}

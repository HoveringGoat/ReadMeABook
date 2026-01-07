/**
 * Component: FlareSolverr Connection Test API
 * Documentation: documentation/integrations/ebook-sidecar.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '@/lib/middleware/auth';
import { testFlareSolverrConnection } from '@/lib/services/ebook-scraper';

export async function POST(request: NextRequest) {
  return requireAuth(request, async (req: AuthenticatedRequest) => {
    return requireAdmin(req, async () => {
      try {
        const { url } = await request.json();

        if (!url) {
          return NextResponse.json(
            { error: 'FlareSolverr URL is required' },
            { status: 400 }
          );
        }

        if (!url.startsWith('http')) {
          return NextResponse.json(
            { error: 'URL must start with http:// or https://' },
            { status: 400 }
          );
        }

        const result = await testFlareSolverrConnection(url);

        return NextResponse.json(result);
      } catch (error) {
        console.error('FlareSolverr test failed:', error);
        return NextResponse.json(
          {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    });
  });
}

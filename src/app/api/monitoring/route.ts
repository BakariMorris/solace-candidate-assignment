import { NextRequest } from "next/server";
import { dbLogger } from "../../../db";
import { apiCache } from "../../../lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'stats';

    switch (type) {
      case 'stats':
        return Response.json({
          database: dbLogger.getQueryStats(),
          cache: apiCache.getStats(),
        });
        
      case 'slow':
        const thresholdParam = searchParams.get('threshold') || '1000';
        const threshold = parseInt(thresholdParam);
        if (isNaN(threshold) || threshold < 0) {
          return Response.json(
            { error: 'Invalid threshold parameter. Must be a positive number.' },
            { status: 400 }
          );
        }
        return Response.json(dbLogger.getSlowQueries(threshold));
        
      case 'errors':
        return Response.json(dbLogger.getErrorLogs());
        
      case 'recent':
        const limitParam = searchParams.get('limit') || '50';
        const limit = parseInt(limitParam);
        if (isNaN(limit) || limit < 1 || limit > 1000) {
          return Response.json(
            { error: 'Invalid limit parameter. Must be a positive number between 1 and 1000.' },
            { status: 400 }
          );
        }
        return Response.json(dbLogger.getRecentLogs(limit));
        
      case 'cache':
        return Response.json(apiCache.getStats());
        
      default:
        return Response.json(
          { error: 'Invalid type parameter. Use: stats, slow, errors, recent, or cache' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    switch (type) {
      case 'cache':
        apiCache.clear();
        return Response.json({ message: 'Cache cleared successfully' });
        
      case 'logs':
        dbLogger.clear();
        return Response.json({ message: 'Database logs cleared successfully' });
        
      default:
        return Response.json(
          { error: 'Invalid type parameter. Use: cache or logs' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
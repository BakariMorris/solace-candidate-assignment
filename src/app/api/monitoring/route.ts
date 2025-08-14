import { NextRequest } from "next/server";
import { dbLogger } from "../../../db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'stats';

    switch (type) {
      case 'stats':
        return Response.json(dbLogger.getQueryStats());
        
      case 'slow':
        const threshold = parseInt(searchParams.get('threshold') || '1000');
        return Response.json(dbLogger.getSlowQueries(threshold));
        
      case 'errors':
        return Response.json(dbLogger.getErrorLogs());
        
      case 'recent':
        const limit = parseInt(searchParams.get('limit') || '50');
        return Response.json(dbLogger.getRecentLogs(limit));
        
      default:
        return Response.json(
          { error: 'Invalid type parameter. Use: stats, slow, errors, or recent' },
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
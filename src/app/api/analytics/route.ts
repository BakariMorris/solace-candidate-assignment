import { NextRequest } from "next/server";
import { searchAnalytics } from "../../../lib/search-analytics";
import { withErrorHandling, ApiError } from "../../../lib/error-handler";

async function handleAnalytics(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') || 'stats';

  switch (type) {
    case 'stats': {
      const timeRangeParam = searchParams.get('timeRange');
      let timeRange;
      
      if (timeRangeParam) {
        const hours = parseInt(timeRangeParam);
        if (!isNaN(hours) && hours > 0) {
          const end = new Date();
          const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
          timeRange = { start, end };
        }
      }
      
      return Response.json(searchAnalytics.getSearchStats(timeRange));
    }

    case 'popular': {
      const limit = parseInt(searchParams.get('limit') || '20');
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new ApiError('Limit must be between 1 and 100', 400);
      }
      
      return Response.json(searchAnalytics.getPopularSearches(limit));
    }

    case 'suggestions': {
      const prefix = searchParams.get('prefix');
      if (!prefix || prefix.length < 2) {
        throw new ApiError('Prefix must be at least 2 characters long', 400);
      }
      
      const limit = parseInt(searchParams.get('limit') || '10');
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw new ApiError('Limit must be between 1 and 50', 400);
      }
      
      return Response.json(searchAnalytics.getSearchSuggestions(prefix, limit));
    }

    case 'trends': {
      const hours = parseInt(searchParams.get('hours') || '24');
      if (isNaN(hours) || hours < 1 || hours > 168) { // Max 1 week
        throw new ApiError('Hours must be between 1 and 168', 400);
      }
      
      return Response.json(searchAnalytics.getSearchTrends(hours));
    }

    case 'recent': {
      const limit = parseInt(searchParams.get('limit') || '100');
      if (isNaN(limit) || limit < 1 || limit > 1000) {
        throw new ApiError('Limit must be between 1 and 1000', 400);
      }
      
      return Response.json(searchAnalytics.getRecentSearches(limit));
    }

    default:
      throw new ApiError(
        'Invalid type parameter. Use: stats, popular, suggestions, trends, or recent',
        400
      );
  }
}

async function handleAnalyticsClear(request: NextRequest): Promise<Response> {
  searchAnalytics.clear();
  return Response.json({ message: 'Search analytics cleared successfully' });
}

export const GET = withErrorHandling(handleAnalytics);
export const DELETE = withErrorHandling(handleAnalyticsClear);
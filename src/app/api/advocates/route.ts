import { NextRequest } from "next/server";
import { sql, eq, and, or, ilike, desc, asc, count } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";
import { ApiResponse, Advocate } from "../../../types/advocate";

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  city?: string;
  degree?: string;
  specialties?: string;
  minExperience?: string;
  maxExperience?: string;
  sortBy?: string;
  sortOrder?: string;
  cursor?: string;
}

interface PaginatedResponse {
  data: Advocate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params: SearchParams = {
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '20',
      search: searchParams.get('search') ?? undefined,
      city: searchParams.get('city') ?? undefined,
      degree: searchParams.get('degree') ?? undefined,
      specialties: searchParams.get('specialties') ?? undefined,
      minExperience: searchParams.get('minExperience') ?? undefined,
      maxExperience: searchParams.get('maxExperience') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      sortOrder: searchParams.get('sortOrder') ?? 'desc',
      cursor: searchParams.get('cursor') ?? undefined,
    };

    // Parse pagination params
    const page = Math.max(1, parseInt(params.page));
    const limit = Math.min(100, Math.max(1, parseInt(params.limit))); // Max 100 per page
    const offset = (page - 1) * limit;

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      // Fallback to in-memory data with basic filtering
      let filteredData = advocateData;

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(advocate => 
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          advocate.city.toLowerCase().includes(searchLower) ||
          advocate.degree.toLowerCase().includes(searchLower) ||
          advocate.specialties.some(specialty => specialty.toLowerCase().includes(searchLower))
        );
      }

      if (params.city) {
        filteredData = filteredData.filter(advocate => 
          advocate.city.toLowerCase().includes(params.city!.toLowerCase())
        );
      }

      if (params.degree) {
        filteredData = filteredData.filter(advocate => 
          advocate.degree.toLowerCase().includes(params.degree!.toLowerCase())
        );
      }

      if (params.specialties) {
        const requestedSpecialties = params.specialties.split(',').map(s => s.trim().toLowerCase());
        filteredData = filteredData.filter(advocate => 
          requestedSpecialties.some(specialty => 
            advocate.specialties.some(advocateSpecialty => 
              advocateSpecialty.toLowerCase().includes(specialty)
            )
          )
        );
      }

      if (params.minExperience) {
        const minExp = parseInt(params.minExperience);
        filteredData = filteredData.filter(advocate => advocate.yearsOfExperience >= minExp);
      }

      if (params.maxExperience) {
        const maxExp = parseInt(params.maxExperience);
        filteredData = filteredData.filter(advocate => advocate.yearsOfExperience <= maxExp);
      }

      // Sorting
      if (params.sortBy && ['firstName', 'lastName', 'city', 'yearsOfExperience', 'createdAt'].includes(params.sortBy)) {
        filteredData.sort((a, b) => {
          const aVal = a[params.sortBy as keyof Advocate];
          const bVal = b[params.sortBy as keyof Advocate];
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const result = aVal.localeCompare(bVal);
            return params.sortOrder === 'desc' ? -result : result;
          }
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            const result = aVal - bVal;
            return params.sortOrder === 'desc' ? -result : result;
          }
          
          return 0;
        });
      }

      const total = filteredData.length;
      const paginatedData = filteredData.slice(offset, offset + limit);
      const totalPages = Math.ceil(total / limit);

      const response: PaginatedResponse = {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };

      return Response.json(response);
    }

    // Database query construction
    const conditions = [];

    // Search across name, city, degree, and specialties
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          ilike(advocates.firstName, searchTerm),
          ilike(advocates.lastName, searchTerm),
          ilike(advocates.city, searchTerm),
          ilike(advocates.degree, searchTerm),
          sql`${advocates.specialties}::text ILIKE ${searchTerm}`
        )
      );
    }

    // City filter
    if (params.city) {
      conditions.push(ilike(advocates.city, `%${params.city}%`));
    }

    // Degree filter
    if (params.degree) {
      conditions.push(ilike(advocates.degree, `%${params.degree}%`));
    }

    // Specialties filter (JSONB contains any of the specified specialties)
    if (params.specialties) {
      const specialtiesList = params.specialties.split(',').map(s => s.trim());
      const specialtyConditions = specialtiesList.map(specialty => 
        sql`${advocates.specialties}::text ILIKE ${'%' + specialty + '%'}`
      );
      conditions.push(or(...specialtyConditions));
    }

    // Experience range filters
    if (params.minExperience) {
      conditions.push(sql`${advocates.yearsOfExperience} >= ${parseInt(params.minExperience)}`);
    }
    if (params.maxExperience) {
      conditions.push(sql`${advocates.yearsOfExperience} <= ${parseInt(params.maxExperience)}`);
    }

    // Cursor-based pagination (if cursor is provided)
    if (params.cursor) {
      const cursorId = parseInt(params.cursor);
      if (params.sortOrder === 'desc') {
        conditions.push(sql`${advocates.id} < ${cursorId}`);
      } else {
        conditions.push(sql`${advocates.id} > ${cursorId}`);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting
    let orderBy;
    const sortColumn = params.sortBy === 'firstName' ? advocates.firstName :
                      params.sortBy === 'lastName' ? advocates.lastName :
                      params.sortBy === 'city' ? advocates.city :
                      params.sortBy === 'yearsOfExperience' ? advocates.yearsOfExperience :
                      advocates.createdAt;

    orderBy = params.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(advocates)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(advocates)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(params.cursor ? 0 : offset);

    const totalPages = Math.ceil(total / limit);

    // Generate cursors for cursor-based pagination
    const nextCursor = data.length === limit ? data[data.length - 1].id?.toString() : undefined;
    const previousCursor = data.length > 0 && page > 1 ? data[0].id?.toString() : undefined;

    const response: PaginatedResponse = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextCursor,
        previousCursor,
      },
    };

    return Response.json(response);

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch advocates'
      },
      { status: 500 }
    );
  }
}

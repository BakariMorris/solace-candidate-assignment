I'll make a loom at the end explaining my thought process and place my PR notes in here as well:

# PR #1: Rendering cleanup and optimization
I am getting the application ready to actually run and satisfy the use case.

page.tsx
--------
* implemented keys to prevent re-renders during list updates
* refactored promise chains -> async await for improved readability & better error handling
* optimized the filtering logic, reducing computational overhead, improving responsiveness for larger data sets
* removed console.log calls
* removed document.querySelector replacing with React state and refs
* replaced raw fetch calls with React Query to handle caching, background updates and state data management

I added the .env file to gitignore
Created a base for the context so Claude would have an easier time understanding the codebase
Added types for the Advocates to enforce type safety

# PR #2: Pagination & enhanced filtering/sort functionality
Adding good filtering and sort functionality as it is one of the core features of this application.

schema.ts
---------
* Given that the application is expected to be read heavy,  with provider and advocate data rarely changing, we're optimizing for query performance by creating indexes on all relevant fields
* Since we're implementing full-text search to allow for customers to discover highly niche providers, we're also indexing large text fields. This ensures efficient search queries over substantial text blocks
* Indexing strategy has been designed to balance query speed with storage overhead, as excessive indexing can impact write performance

route.ts
--------
* Implemented cursor based pagination to handle datasets efficiently and ensure stable pagination when filtering or sorting dynamically changing records. Using a cursor avoids performance degradation on deep pages and reduce the risk of missing/duplicated results in distributed environments
* Integrated multi-criteria filtering and case insensitive sorting to align with user expectations

# PR #3: Logging and Observability
I wanted to add some logging and observability to get actual numbers on the improvements we make to the backend.

db/logger.ts
------------
Stores up to 1000 recent queries with metadata(duration, timestamp, success/failure). Color codes the data based on speed and gives easy access to view fast and slow queries. Also allows for analytics on the logs such as success rates and error tracking. Can change the thresholds based on the SLAs for your org

monitoring/route.ts
--------
Performance monitoring endpoint that provides easy access to commonly accessed logger data like query statistics, slow query analysis, Error logs and recent query logs

index.ts
--------
Adds logging to all db calls

# PR #4: Caching, Rate Limiting & Error handling

## Functions

page.tsx
--------
Fixed the phone number search feature, now also searches phone numbers based on the searchTerm.

cache.ts
--------
In memory caching system utilizing a Map. Generates ttl for all cached data and upon receiving a get request, deletes it. Also has constants for the TTLS, short, medium, long, very_long and key generation based off the search parameters.

rate-limiter.ts
---------------
Added rate limiting for API endpoints, 100 requests/min to avoid DOS vulnerability & 50 search request/min. Has functionality to cleanup the entries, getStats and returns a 429 upon receiving too many requests.

search-analytics.ts
-------------------
Keeps a record of all of the searches, up to 10,000 and logs every time a search is made via the API. Also includes CRUD operations on this data and even creates search suggestions based on the prefix

error-handler.ts
----------------
Creates standardizes errors to improve maintainability. Also holds the search params validation, enforcing we're receiving the expected data type.

## Routes

api/advocates/route.ts
----------------------
Now utilizes the apiCache, cacheKeys, rateLimiter, error handling and the search analytics in all requests made on the advocates route.

api/analytics/route.ts
----------------------
Sets up routes to pull all of the data from search analytics, it has good fallbacks for grabbing stats about the queries. The popular search terms and queries. The suggestions based off of the prefix given (min 2 characters). The trends within the search terms and the most recent queries run. 

api/monitoring/route.ts
-----------------------
Extends the functionality to include returning the stats from the caching layer. It also now includes a delete route to clear the logger and cache.
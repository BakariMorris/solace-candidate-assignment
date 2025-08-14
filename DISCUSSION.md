I'll make a loom at the end explaining my thought process and place my PR notes in here as well:

PR #1: 
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

PR #2: 
schema.ts
-----------
* Given that the application is expected to be read heavy,  with provider and advocate data rarely changing, we're optimizing for query performance by creating indexes on all relevant fields
* Since we're implementing full-text search to allow for customers to discover highly niche providers, we're also indexing large text fields. This ensures efficient search queries over substantial text blocks
* Indexing strategy has been designed to balance query speed with storage overhead, as excessive indexing can impact write performance

route.ts
---------
* Implemented cursor based pagination to handle datasets efficiently and ensure stable pagination when filtering or sorting dynamically changing records. Using a cursor avoids performance degradation on deep pages and reduce the risk of missing/duplicated results in distributed environments
* Integrated multi-criteria filtering and case insensitive sorting to align with user expectations
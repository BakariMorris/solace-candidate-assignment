I'll make a loom at the end explaining my thought process and place my PR notes in here as well:

PR # 1: 
page.tsx
* implemented keys to prevent re-renders during list updates
* refactored promise chains -> async await for improved readability & better error handling
* optimized the filtering logic, reducing computational overhead, improving responsiveness for larger data sets
* removed console.log calls
* removed document.querySelector replacing with React state and refs
* replaced raw fetch calls with React Query to handle caching, background updates and state data management

I added the .env file to gitignore
Created a base for the context so Claude would have an easier time understanding the codebase
Added types for the Advocates to enforce type safety
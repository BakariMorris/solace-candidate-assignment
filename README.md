Solace Advocate Search — Candidate Submission 🚀

Hello! This is my candidate sumbission for the Solace Advocate Search application. The goal was to take an early-stage prototype and transform it into a production-ready, high-performance platform capable of handling 100k+ advocates with robust search, filtering, booking, and observability features. Feel free to visit my: 

- **Deployed site:** [https://solace-candidate-assignment-tau.vercel.app/](https://solace-candidate-assignment-tau.vercel.app/)
- **Explainer video:** [Watch on Loom](https://www.loom.com/share/a6c7ca9bf6854e81a076cb9352729f58)
- **Project breakdown:** [DISCUSSION.md on GitHub](https://github.com/BakariMorris/solace-candidate-assignment/blob/master/DISCUSSION.md) — Ordered by PR


This README serves as both technical documentation and a narrative walkthrough of my approach across multiple phases (mapped to pull requests). At the end of the process, I’ll provide a Loom walkthrough of my thought process and highlight design trade-offs made along the way. If you would like a more in depth idea of the

🌟 Highlights

Scalable architecture with cursor-based pagination, full-text indexing, caching, and rate limiting.

High-performance frontend rendering 100k+ records via virtualization with smooth UX features (debounced search, optimistic filtering, shareable states).

Modern design system powered by shadcn/ui, Tailwind, and custom design tokens for a polished, accessible interface.

Advanced search & filtering with autocomplete, analytics-driven suggestions, and dynamic filter categories.

Operational excellence: observability, query logging, monitoring APIs, and SLA-configurable thresholds.

End-user features: advocate comparison, booking workflows, and professional profile data with realistic bios, images, and ratings.

🧩 Architecture Overview

Frontend Stack

Next.js (App Router) for routing, error boundaries, and server-side rendering.

React Query for intelligent caching, retries, and server state management.

Zustand for lightweight, persistent client-side state (search, favorites, comparison).

@tanstack/react-virtual for virtualization of large datasets.

shadcn/ui + Tailwind for modern, accessible UI components.

Backend & Infra

Drizzle ORM with Postgres for strongly-typed schema & migrations.

Cursor-based pagination for stable, performant data access.

Full-text search with advanced indexing strategy.

Custom caching layer with TTL-based invalidation.

Rate limiting via middleware for DoS protection.

Monitoring APIs with query logging, slow query detection, and analytics.

Dev Experience

End-to-end TypeScript integration (strict mode).

Error boundaries (error.tsx, global-error.tsx, not-found.tsx, loading.tsx).

Realistic seed data for demos (profile images, bios, certifications, rates).

Built with scalability and observability in mind from day one.

📌 Phased Development (PR Summaries)
PR #1: Rendering Cleanup & Optimization

Replaced raw fetch with React Query.

Adopted modern React patterns (async/await, keys, removed DOM manipulation).

Introduced TypeScript models for Advocates.

Optimized filtering logic for responsiveness.

PR #2: Pagination & Enhanced Filtering/Sort

Implemented cursor-based pagination.

Added comprehensive DB indexing and full-text search.

Built multi-criteria filtering with case-insensitive sorting.

PR #3: Logging & Observability

Added query performance logging with metadata.

Built monitoring dashboard endpoints.

Implemented slow query detection & SLA thresholds.

PR #4: Caching, Rate Limiting & Error Handling

Built in-memory cache with configurable TTL.

Added rate limiting (100 req/min general, 50 req/min search).

Enhanced search with phone number support & analytics.

Standardized error responses & parameter validation.

PR #5: Frontend Optimization

Integrated virtualized rendering for 100k+ rows.

Added Zustand for global state management.

Implemented debounced search (120ms) with optimistic updates.

Introduced URL synchronization for shareable states.

Enhanced developer experience with stronger TS tooling.

PR #6: Realistic Data, Dynamic Resizing, Route Optimization

Added profile images and generated bios.

Implemented LazyImage with Intersection Observer.

Built estimateRowHeight for content-aware row sizing.

Extended TypeScript interfaces and logging integration.

Completed missing Next.js error components.

PR #7: UI/UX Overhaul & Advanced Features

Integrated shadcn/ui with custom design tokens and Solace green theme.

Built advanced search (autocomplete, suggestions, recent searches).

Implemented dynamic filters with filter chips.

Added Advocate Profile & Booking Modals with professional detail views.

Built comparison tool for up to 4 advocates with CSV export.

Added booking workflow (multi-step, consultation types, simulated email confirmations).

Implemented search term highlighting across multiple fields.

Enhanced accessibility (ARIA, keyboard navigation).

🎨 UX Showcase

Responsive grid scaling from 1 → 4 columns.

Keyboard-first navigation with ARIA-compliant components.

Lazy-loaded images and content-aware height estimation.

Comparison tables and filter chips for intuitive decision-making.

🛠️ Running Locally
# Clone repo
git clone <candidate-repo-url>
cd solace-advocate-search

# Install deps
pnpm install

# Setup DB
pnpm db:migrate
pnpm db:seed

# Run dev server
pnpm dev

📹 Loom Walkthrough

At the end of this process, I’ll provide a short Loom video walking through:

Architecture choices and trade-offs

UX decisions and design polish

Observability & performance considerations

What I’d do next if scaling to millions of records

📌 Candidate Notes

Each PR was carefully scoped to reflect real-world iteration cycles.

Strong focus on scalability, developer experience, and observability from the start.

Balanced production-readiness with time constraints by prioritizing features with the greatest impact.


👉 This README demonstrates how I’d approach building and documenting a candidate project like a production engineer: clear technical rigor, strong design thinking, and thoughtful communication.


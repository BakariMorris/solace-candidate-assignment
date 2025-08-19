# Advocate Search Platform

A high-performance advocate search and booking platform built with Next.js and TypeScript. Find, compare, and book consultations with qualified advocates across various specialties.

## 🚀 Key Features

### Search & Discovery
- **Advanced Search**: Full-text search across advocate names, specialties, locations, and credentials
- **Smart Filtering**: Multi-criteria filters for specialty, location, experience level, and availability
- **Autocomplete**: Real-time search suggestions with recent search history
- **Virtualized Rendering**: Handles 100k+ advocates with smooth scrolling performance

### Advocate Management
- **Professional Profiles**: Detailed advocate profiles with photos, bios, credentials, and ratings
- **Comparison Tool**: Side-by-side comparison of up to 4 advocates with CSV export
- **Favorites**: Save and organize preferred advocates for quick access
- **Availability Tracking**: Real-time availability status and booking calendar

### Booking System
- **Multi-step Booking**: Consultation type selection, date/time scheduling, and confirmation
- **Multiple Consultation Types**: Phone, video, and in-person consultations with pricing
- **Calendar Integration**: Available time slots for the next 14 business days
- **Email Notifications**: Booking confirmations and reminders

### User Experience
- **Modern Design System**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with adaptive layouts (1-4 column grid)
- **Dark/Light Theme**: System-aware theme switching
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Onboarding Tour**: Interactive guide for new users

### Performance & Architecture
- **Cursor-based Pagination**: Efficient data loading for large datasets
- **Debounced Search**: 120ms debounced search with optimistic updates
- **Caching Strategy**: In-memory caching with configurable TTL
- **Rate Limiting**: DoS protection (100 req/min general, 50 req/min search)
- **Error Boundaries**: Comprehensive error handling with recovery options

### Analytics & Monitoring
- **Search Analytics**: Track search patterns and trending queries
- **Performance Monitoring**: Query logging with slow query detection
- **User Analytics**: Track user interactions and preferences
- **SLA Monitoring**: Configurable performance thresholds

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand with persistence
- **Data Fetching**: React Query with caching
- **Database**: PostgreSQL with Drizzle ORM
- **Virtualization**: @tanstack/react-virtual
- **Icons**: Lucide React

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up database
npm run migrate:up
npm run seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Performance Targets

- **Initial Load**: < 2 seconds
- **Search Response**: < 120ms
- **Dataset Size**: Supports 100k+ advocates
- **Lighthouse Score**: 95+
- **Accessibility**: WCAG 2.1 compliant

## 🔗 Links

- **Live Demo**: [https://advocate-search.vercel.app](https://advocate-search.vercel.app)
- **Technical Documentation**: See [DISCUSSION.md](./DISCUSSION.md) for detailed implementation notes
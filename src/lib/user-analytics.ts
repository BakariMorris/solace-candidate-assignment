"use client";

interface UserEvent {
  timestamp: Date;
  eventType: string;
  category: 'navigation' | 'interaction' | 'engagement' | 'conversion' | 'performance';
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  pageUrl?: string;
  metadata?: Record<string, any>;
}

interface UserSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  userId?: string;
  pageViews: number;
  interactions: number;
  duration: number;
  exitPage?: string;
  entryPage?: string;
  userAgent?: string;
  referrer?: string;
}

interface ConversionFunnel {
  step: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

interface UserJourney {
  sessionId: string;
  events: UserEvent[];
  duration: number;
  pageViews: string[];
  interactions: number;
  outcome: 'converted' | 'abandoned' | 'ongoing';
}

class UserAnalytics {
  private events: UserEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private currentSessionId: string;
  private userId?: string;
  private readonly maxEvents = 10000;
  private startTime: Date;

  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.startTime = new Date();
    
    if (typeof window !== 'undefined') {
      this.initializeTracking();
      this.startSession();
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackEvent('page_hidden', 'engagement', 'visibility_change');
      } else {
        this.trackEvent('page_visible', 'engagement', 'visibility_change');
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endCurrentSession();
    });

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();

    // Track clicks on important elements
    this.trackClickEvents();
  }

  private startSession() {
    const session: UserSession = {
      sessionId: this.currentSessionId,
      startTime: new Date(),
      userId: this.userId,
      pageViews: 1,
      interactions: 0,
      duration: 0,
      entryPage: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    };

    this.sessions.set(this.currentSessionId, session);
    this.trackEvent('session_start', 'navigation', 'session');
  }

  private endCurrentSession() {
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();
      session.exitPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
    }
    
    this.trackEvent('session_end', 'navigation', 'session', undefined, session?.duration);
  }

  private trackScrollDepth() {
    let maxScrollDepth = 0;
    let scrollDepthReported = new Set<number>();

    const handleScroll = () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Report at 25%, 50%, 75%, 100%
        [25, 50, 75, 100].forEach(threshold => {
          if (scrollDepth >= threshold && !scrollDepthReported.has(threshold)) {
            scrollDepthReported.add(threshold);
            this.trackEvent('scroll_depth', 'engagement', 'scroll', `${threshold}%`, threshold);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private trackTimeOnPage() {
    let timeSpent = 0;
    let lastActiveTime = Date.now();
    let isActive = true;

    const updateTimeSpent = () => {
      if (isActive) {
        const now = Date.now();
        timeSpent += now - lastActiveTime;
        lastActiveTime = now;
      }
    };

    // Track when user becomes inactive
    const handleInactive = () => {
      isActive = false;
      this.trackEvent('user_inactive', 'engagement', 'activity');
    };

    const handleActive = () => {
      if (!isActive) {
        isActive = true;
        lastActiveTime = Date.now();
        this.trackEvent('user_active', 'engagement', 'activity');
      }
    };

    // Report time spent every 30 seconds
    setInterval(() => {
      updateTimeSpent();
      if (timeSpent > 0) {
        this.trackEvent('time_on_page', 'engagement', 'duration', undefined, Math.round(timeSpent / 1000));
      }
    }, 30000);

    document.addEventListener('mouseout', (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        handleInactive();
      }
    });

    document.addEventListener('mouseover', handleActive);
    document.addEventListener('click', handleActive);
    document.addEventListener('keypress', handleActive);
    document.addEventListener('scroll', handleActive, { passive: true });
  }

  private trackClickEvents() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Track clicks on specific elements
      if (target.matches('[data-track]')) {
        const trackingData = target.getAttribute('data-track');
        this.trackEvent('element_click', 'interaction', 'click', trackingData || undefined);
      }

      // Track clicks on buttons
      if (target.matches('button') || target.closest('button')) {
        const button = target.matches('button') ? target : target.closest('button')!;
        const buttonText = button.textContent?.trim().substring(0, 50) || 'Unknown';
        this.trackEvent('button_click', 'interaction', 'click', buttonText);
      }

      // Track clicks on links
      if (target.matches('a') || target.closest('a')) {
        const link = target.matches('a') ? target : target.closest('a')!;
        const href = link.getAttribute('href') || undefined;
        this.trackEvent('link_click', 'interaction', 'click', href);
      }
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    
    // Update current session
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.userId = userId;
    }
  }

  trackEvent(
    eventType: string,
    category: 'navigation' | 'interaction' | 'engagement' | 'conversion' | 'performance',
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ) {
    const event: UserEvent = {
      timestamp: new Date(),
      eventType,
      category,
      action,
      label,
      value,
      userId: this.userId,
      sessionId: this.currentSessionId,
      pageUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
      metadata
    };

    this.events.push(event);

    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Update session interaction count
    const session = this.sessions.get(this.currentSessionId);
    if (session && category === 'interaction') {
      session.interactions++;
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${category}:${action}`, { eventType, label, value, metadata });
    }
  }

  // Track specific advocate platform events
  trackAdvocateView(advocateId: number, advocateName: string) {
    this.trackEvent('advocate_view', 'engagement', 'view_profile', advocateName, advocateId);
  }

  trackAdvocateContact(advocateId: number, advocateName: string, contactMethod: string) {
    this.trackEvent('advocate_contact', 'conversion', contactMethod, advocateName, advocateId);
  }

  trackSearchPerformed(query: string, resultCount: number, responseTime: number) {
    this.trackEvent('search_performed', 'interaction', 'search', query.substring(0, 50), resultCount, {
      responseTime,
      queryLength: query.length
    });
  }

  trackFilterUsed(filterType: string, filterValue: string) {
    this.trackEvent('filter_used', 'interaction', 'filter', `${filterType}:${filterValue}`);
  }

  trackBookingStarted(advocateId: number) {
    this.trackEvent('booking_started', 'conversion', 'booking_flow', undefined, advocateId);
  }

  trackBookingCompleted(advocateId: number, bookingValue?: number) {
    this.trackEvent('booking_completed', 'conversion', 'booking_success', undefined, advocateId, {
      value: bookingValue
    });
  }

  trackComparisonUsed(advocateIds: number[]) {
    this.trackEvent('comparison_used', 'interaction', 'compare_advocates', undefined, advocateIds.length, {
      advocateIds
    });
  }

  trackFavoriteAdded(advocateId: number) {
    this.trackEvent('favorite_added', 'interaction', 'add_favorite', undefined, advocateId);
  }

  trackPageView(page: string) {
    this.trackEvent('page_view', 'navigation', 'navigate', page);
    
    // Update session page views
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.pageViews++;
    }
  }

  getEvents(category?: string, timeRange?: { start: Date; end: Date }): UserEvent[] {
    let filtered = [...this.events];
    
    if (category) {
      filtered = filtered.filter(event => event.category === category);
    }
    
    if (timeRange) {
      filtered = filtered.filter(event => 
        event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getUserJourney(sessionId?: string): UserJourney | null {
    const targetSessionId = sessionId || this.currentSessionId;
    const session = this.sessions.get(targetSessionId);
    const sessionEvents = this.events.filter(event => event.sessionId === targetSessionId);
    
    if (!session || sessionEvents.length === 0) return null;

    const pageViews = sessionEvents
      .filter(event => event.eventType === 'page_view')
      .map(event => event.label || event.pageUrl || '')
      .filter(Boolean);

    const interactions = sessionEvents.filter(event => event.category === 'interaction').length;
    const hasConversion = sessionEvents.some(event => event.category === 'conversion');
    
    return {
      sessionId: targetSessionId,
      events: sessionEvents,
      duration: session.duration,
      pageViews,
      interactions,
      outcome: hasConversion ? 'converted' : session.endTime ? 'abandoned' : 'ongoing'
    };
  }

  getConversionFunnel(): ConversionFunnel[] {
    const funnelSteps = [
      { step: 'page_visit', filter: (e: UserEvent) => e.eventType === 'page_view' },
      { step: 'search_performed', filter: (e: UserEvent) => e.eventType === 'search_performed' },
      { step: 'advocate_viewed', filter: (e: UserEvent) => e.eventType === 'advocate_view' },
      { step: 'booking_started', filter: (e: UserEvent) => e.eventType === 'booking_started' },
      { step: 'booking_completed', filter: (e: UserEvent) => e.eventType === 'booking_completed' }
    ];

    const sessionIds = new Set(this.events.map(e => e.sessionId));
    const totalSessions = sessionIds.size;

    return funnelSteps.map((step, index) => {
      const sessionsAtStep = new Set(
        this.events.filter(step.filter).map(e => e.sessionId)
      ).size;

      const conversionRate = totalSessions > 0 ? (sessionsAtStep / totalSessions) * 100 : 0;
      const previousStepSessions = index > 0 ? 
        new Set(this.events.filter(funnelSteps[index - 1].filter).map(e => e.sessionId)).size :
        totalSessions;
      
      const dropOffRate = previousStepSessions > 0 ? 
        ((previousStepSessions - sessionsAtStep) / previousStepSessions) * 100 : 0;

      return {
        step: step.step,
        users: sessionsAtStep,
        conversionRate,
        dropOffRate
      };
    });
  }

  getEngagementMetrics(timeRange?: { start: Date; end: Date }) {
    const events = this.getEvents(undefined, timeRange);
    const sessions = Array.from(this.sessions.values());
    
    const avgSessionDuration = sessions.length > 0 ?
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0;

    const avgPageViews = sessions.length > 0 ?
      sessions.reduce((sum, s) => sum + s.pageViews, 0) / sessions.length : 0;

    const bounceRate = sessions.length > 0 ?
      (sessions.filter(s => s.pageViews === 1).length / sessions.length) * 100 : 0;

    const topPages = this.getTopPages(events);
    const topEvents = this.getTopEvents(events);

    return {
      totalSessions: sessions.length,
      totalEvents: events.length,
      avgSessionDuration: Math.round(avgSessionDuration / 1000), // in seconds
      avgPageViews,
      bounceRate,
      topPages,
      topEvents
    };
  }

  private getTopPages(events: UserEvent[]) {
    const pageCounts = new Map<string, number>();
    
    events
      .filter(event => event.eventType === 'page_view')
      .forEach(event => {
        const page = event.pageUrl || event.label || 'Unknown';
        pageCounts.set(page, (pageCounts.get(page) || 0) + 1);
      });

    return Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));
  }

  private getTopEvents(events: UserEvent[]) {
    const eventCounts = new Map<string, number>();
    
    events.forEach(event => {
      const key = `${event.category}:${event.action}`;
      eventCounts.set(key, (eventCounts.get(key) || 0) + 1);
    });

    return Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));
  }

  exportAnalytics(format: 'json' | 'csv' = 'json'): string {
    const data = {
      events: this.events,
      sessions: Array.from(this.sessions.values()),
      engagementMetrics: this.getEngagementMetrics(),
      conversionFunnel: this.getConversionFunnel()
    };

    if (format === 'csv') {
      // Export events as CSV
      const headers = ['timestamp', 'eventType', 'category', 'action', 'label', 'value', 'sessionId', 'userId', 'pageUrl'];
      const rows = this.events.map(event => [
        event.timestamp.toISOString(),
        event.eventType,
        event.category,
        event.action,
        event.label || '',
        event.value || '',
        event.sessionId,
        event.userId || '',
        event.pageUrl || ''
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    
    return JSON.stringify(data, null, 2);
  }

  clear() {
    this.events = [];
    this.sessions.clear();
  }

  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cutoff = new Date(Date.now() - maxAge);
    
    this.events = this.events.filter(event => event.timestamp > cutoff);
    
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (session.startTime < cutoff) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Global instance
export const userAnalytics = new UserAnalytics();

// Auto cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    userAnalytics.cleanup();
  }, 60 * 60 * 1000);
}

export type { UserEvent, UserSession, ConversionFunnel, UserJourney };
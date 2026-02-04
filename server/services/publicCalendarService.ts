/**
 * Public Calendar Service
 * Fetches and parses events from a public Google Calendar iCal feed.
 * Used for displaying upcoming mentor sessions to all mentorados.
 */

import ICAL from "ical.js";
import { createLogger } from "../_core/logger";

const logger = createLogger({ service: "publicCalendar" });

// Calendar configuration
const PUBLIC_CALENDAR_ID =
  "c15a01eaaf196a178bb081c139c1b533521c0fb67aebd3df87043d7257f65aa1@group.calendar.google.com";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  events: CalendarEvent[];
  timestamp: number;
}

let cache: CachedData | null = null;

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  location: string | null;
  zoomUrl: string | null;
}

/**
 * Extract Zoom URL from event description or location
 */
function extractZoomUrl(description: string | null, location: string | null): string | null {
  const text = `${description || ""} ${location || ""}`;

  // Match Zoom URLs
  const zoomRegex = /https?:\/\/[^\s]*zoom\.us\/[^\s)"]*/gi;
  const match = text.match(zoomRegex);

  if (match) {
    return match[0];
  }

  // Also check for Google Meet URLs as fallback
  const meetRegex = /https?:\/\/meet\.google\.com\/[^\s)"]*/gi;
  const meetMatch = text.match(meetRegex);

  return meetMatch ? meetMatch[0] : null;
}

/**
 * Parse ICS data into CalendarEvent objects
 */
function parseICalFeed(icsData: string): CalendarEvent[] {
  try {
    const jCalData = ICAL.parse(icsData);
    const comp = new ICAL.Component(jCalData);
    const vevents = comp.getAllSubcomponents("vevent");

    const events: CalendarEvent[] = [];

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);

      // Skip events without a start date
      if (!event.startDate) continue;

      const description = vevent.getFirstPropertyValue("description") as string | null;
      const location = vevent.getFirstPropertyValue("location") as string | null;

      events.push({
        id: event.uid || `${Date.now()}-${Math.random()}`,
        title: event.summary || "Sem título",
        description,
        start: event.startDate.toJSDate(),
        end: event.endDate?.toJSDate() || event.startDate.toJSDate(),
        location,
        zoomUrl: extractZoomUrl(description, location),
      });
    }

    return events;
  } catch (error) {
    logger.error("ics_parse_failed", error);
    return [];
  }
}

/**
 * Fetch public calendar events from Google Calendar
 */
async function fetchPublicCalendarEvents(): Promise<CalendarEvent[]> {
  const icsUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(PUBLIC_CALENDAR_ID)}/public/basic.ics`;

  try {
    const response = await fetch(icsUrl, {
      headers: {
        Accept: "text/calendar",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const icsData = await response.text();
    return parseICalFeed(icsData);
  } catch (error) {
    logger.error("calendar_fetch_failed", error);
    return [];
  }
}

/**
 * Get upcoming mentor sessions from the public calendar.
 * Uses in-memory cache with 5-minute TTL.
 */
export async function getUpcomingMentorSessions(): Promise<CalendarEvent[]> {
  const now = Date.now();

  // Check cache validity
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.events.filter((e) => e.start.getTime() > now);
  }

  // Fetch fresh data
  const allEvents = await fetchPublicCalendarEvents();

  // Sort by start date
  allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Update cache
  cache = {
    events: allEvents,
    timestamp: now,
  };

  // Return only future events
  return allEvents.filter((e) => e.start.getTime() > now);
}

/**
 * Get the next upcoming session (convenience method)
 */
export async function getNextMentorSession(): Promise<CalendarEvent | null> {
  const sessions = await getUpcomingMentorSessions();
  return sessions[0] || null;
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearPublicCalendarCache(): void {
  cache = null;
}

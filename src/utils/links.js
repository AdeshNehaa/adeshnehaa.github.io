import { wedding, isPlaceholder } from '../config/wedding.js';

/** Google Maps link: the official share link if configured, otherwise a search. */
export function getMapsUrl(venue = wedding.venue) {
  if (venue.mapsUrl) return venue.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapsQuery || venue.name)}`;
}

const toGCalStamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** "2026-12-06" → "20261206/20261207": an all-day entry (Google's end date is the day after). */
function allDayRange(isoDate) {
  const day = new Date(`${isoDate}T00:00:00Z`);
  const next = new Date(day.getTime() + 86400000);
  const stamp = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
  return `${stamp(day)}/${stamp(next)}`;
}

/** Where an event is held, as plain text: the main venue with its address, or the event's own place. */
function getEventLocation(event, venue) {
  const known = (value) => typeof value === 'string' && value.trim() && !isPlaceholder(value);
  if (event.venue !== undefined) return known(event.venue) ? event.venue.trim() : '';
  return [venue.name, venue.address, venue.city].filter(known).join(', ');
}

/**
 * Google Calendar "add event" link for an event from the config.
 * With `start` and `end` it is a timed entry; with only a `date` it is an all-day one.
 */
export function getCalendarUrl(event, venue = wedding.venue) {
  const { groom, bride } = wedding.couple;
  const timed = event.start && event.end;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.name} · ${groom.name} & ${bride.name}`,
    dates: timed ? `${toGCalStamp(event.start)}/${toGCalStamp(event.end)}` : allDayRange(event.date),
    details: event.description || '',
  });
  const location = getEventLocation(event, venue);
  if (location) params.set('location', location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Resolve a path in /public against the Vite base path (works on GitHub Pages). */
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

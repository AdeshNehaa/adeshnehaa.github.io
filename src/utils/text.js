const NBSP = ' ';

/**
 * Keeps a title or address abbreviation on the same line as the word after it, so a
 * name never wraps as "Mrs. Shobha & Mr." / "Shivaji…" and "Dist." never ends a line.
 * (Only the kind of space changes; the text itself is untouched.)
 */
export function keepTitlesTogether(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/(^|[\s(])(Mr\.|Mrs\.|Ms\.|Dr\.|Shri\.?|Smt\.?|Sau\.?|Late|Tal\.|Dist\.|Post|Opp\.) (?=\S)/g, `$1$2${NBSP}`);
}

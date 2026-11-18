import { isPlaceholder, cleanPlaceholder } from '../config/wedding.js';

/**
 * Shows a value from the wedding config.
 * A [placeholder] is shown without its brackets in the gentle "to be added" style;
 * anything else is shown exactly as written.
 *
 *   <ConfigText value={venue.address} />
 *   <ConfigText>{venue.address}</ConfigText>
 */
export default function ConfigText({ value, children }) {
  const text = value ?? children;
  if (!isPlaceholder(text)) return text ?? null;
  return <span className="placeholder-text">{cleanPlaceholder(text)}</span>;
}

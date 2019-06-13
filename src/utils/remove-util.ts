/**
 * removes a string from a text content
 * @param {string} content - The content to remove from
 * @param {string} toRemove - the sting to remove
 * @returns {string} newContent with the string removed
 */
export function removeStringFromContent(content: string, toRemove: string) {
  let prefix;
  let suffix;

  const pos = content.search(toRemove);

  if (pos !== -1 ) {
    // remove comma of the line before if there is any
    (content.charAt(pos - 1) === ',') ? prefix = content.substring(0, pos-1) : prefix = content.substring(0, pos-2);
    suffix = content.substring(pos + toRemove.length);
  }

  const newContent = `${prefix}${suffix}`;

  return newContent
}

/**
 * removes a string from a text content
 * @param {string} content - The content to remove from
 * @param {string} toRemove - the sting to remove
 * @returns {string} newContent with the string removed
 */
export function removeStringFromContent(content: string, toRemove: string): string {
  let prefix;
  let suffix;
  let newContent

  const pos = content.search(toRemove);

  if (pos !== -1 ) {
    // remove comma of the line before if there is any
    (content.charAt(pos - 1) === ',') ? prefix = content.substring(0, pos-2) : prefix = content.substring(0, pos-1);
    suffix = content.substring(pos + toRemove.length);
  }
  if (prefix && suffix) {
    newContent = `${prefix}${suffix}`;
  } else { // return the same content if the prefix and suffix variables are not defined
    newContent = content
  }
  return newContent
}

module.exports = function cleanKey (key) {
  // strings and can't contain ".", "#", "$", "/", "[", or "]"
  return (key || '')
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\?/g, "")
    .replace(/\$/g, "")
    .replace(/\//g, "")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/\#/g, "")
    .trim()
}

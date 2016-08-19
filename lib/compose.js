
module.exports = function compose (persona, text, attachments) {
  return {
    'username': persona.name,
    'text': text,
    'attachments': attachments || [],
    'icon_url': persona.icon
  }
}

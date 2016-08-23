var cleanKey = require('./clean-key')

module.exports = (slapp, db) => {
  slapp.command('/learn', /^import/, (msg) => {
    var sayings
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id
    var text = msg.body.text
    var importStr = text.substr(text.indexOf('\n') + 1)

    // handle import
    try {
      sayings = JSON.parse(importStr)
    } catch (e) {
      return msg.say(`Sorry I couldn't parse that JSON: ${e.message}`)
    }

    db.getDefaultedPinnedOrCurrentPersona(team_id, channel_id, (err, persona) => {
      if (err) {
        console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I had a problem finding the current persona to save this saying under.'
        })
      }

      // TODO: This should really be an async loop so we don't respond until after all are saved
      Object.keys(sayings).forEach((key) => {
        var saying = sayings[key]
        saying.id = key
        console.log('saving saying: ', saying)
        db.saveSaying(team_id, persona.id, saying, (err) => {
          if (err) {
            console.log(err)
          }
        })
      })

      msg.say(`Imported ${Object.keys(sayings).length} items`)
    })
  })

  slapp.command('/learn', function (msg) {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id
    var learn = msg.body.text

    var orig_man_say = learn.substr(0, learn.indexOf('\n') - 1)
    var saying_id = cleanKey(orig_man_say)
    var bot_say = learn.substr(learn.indexOf('\n') + 1)

    if (!saying_id || !bot_say) {
      return msg.respond({
        response_type: 'ephemeral',
        text: `missing param - you say is (${orig_man_say}) I say is (${bot_say}) - please use \`/learn [you say] \\n [bot say]\` to teach the bot new tricks (Use shift+enter for new lines)`
      })
    }

    var parsed_bot_say
    var attachments = null

    if (bot_say.indexOf('"attachments') > 0) {
      try {
        parsed_bot_say = JSON.parse(bot_say)
      } catch (err) {
        return msg.say('Could not digest your JSON. Please test at https://api.slack.com/docs/messages/builder')
      }

      attachments = parsed_bot_say.attachments
      bot_say = parsed_bot_say.text || ''
    }

    // Figure out where we're saving this saying to, will use default persona if nothing is pinned or current
    db.getDefaultedPinnedOrCurrentPersona(team_id, channel_id, (err, persona) => {
      if (err) {
        console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I had a problem finding the current persona to save this saying under.'
        })
      }

      var saying = {
        id: saying_id,
        humansay: orig_man_say,
        botsay: bot_say,
        attachments: attachments
      }

      console.log(`Saving saying, key=[${saying_id}] value=[${bot_say}]`, attachments)
      db.saveSaying(team_id, persona.id, saying, (err) => {
        if (err) {
          console.log(err)
          return msg.respond({
            response_type: 'ephemeral',
            text: 'I had a problem saving your saying.'
          })
        }

        if (saying.attachments) {
          msg.say(`When you say: ${orig_man_say}\n I will say: ${parsed_bot_say}`)
        } else {
          msg.say(`When you say: ${orig_man_say}\n I will say: ${bot_say}`)
        }
      })
    })
  })

  slapp.command('/new-persona', (msg) => {
    var team_id = msg.meta.team_id
    var new_persona_id = cleanKey(msg.body.text)

    db.getPersona(team_id, new_persona_id, (err, persona) => {
      if (err) {
        return msg.respond({
          response_type: 'ephemeral',
          text: 'Sorry, I had an issue checking to see if that persona already exists'
        })
      }

      if (persona) {
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I already have this persona'
        })
      }

      var new_persona = {
        id: new_persona_id,
        name: msg.body.text.trim(),
        icon: 'http://lorempixel.com/48/48'
      }

      db.savePersona(team_id, new_persona, (err) => {
        if (err) {
          return msg.respond({
            response_type: 'ephemeral',
            text: 'Sorry, I had an issue saving your new persona'
          })
        }

        // set current persona for team to new persona
        db.setCurrentPersona(team_id, new_persona_id, (err) => {
          if (err) {
            return msg.respond({
              response_type: 'ephemeral',
              text: 'Sorry, I had an issue setting your current persona.'
            })
          }

          // make sure list of personas for team is updated

          msg.respond({
            response_type: 'ephemeral',
            text: `Created new persona - ${new_persona_id}`
          })
        })
      })
    })
  })

  slapp.command('/load-persona', (msg) => {
    var team_id = msg.meta.team_id
    var persona_id = cleanKey(msg.body.text)

    db.getPersona(team_id, persona_id, (err, persona) => {
      if (err || !persona) {
        if (err) console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: `I need my meds! could not find - ${persona_id}`
        })
      }

      // Set as the current persona
      db.setCurrentPersona(team_id, persona_id, (err) => {
        if (err) {
          console.log(err)
        }

        msg.respond({
          response_type: 'ephemeral',
          text: `Loaded new persona - ${persona_id}`
        })
      })
    })
  })

  slapp.command('/list-personas', (msg) => {
    var team_id = msg.meta.team_id

    db.getPersonas(team_id, (err, personas) => {
      if (err) {
        return msg.respond({
          response_type: 'ephemeral',
          text: 'Sorry, I had an issue getting your personas.'
        })
      }

      // getPersonas returns a map of { key: persona }
      var personaKeys = Object.keys(personas)

      if (personaKeys.length === 0) {
        return msg.respond({
          response_type: 'ephemeral',
          text: 'No Personas'
        })
      }

      msg.respond({
        response_type: 'ephemeral',
        text: `Personas -  ${personaKeys.join(', ')}`
      })
    })
  })

  slapp.command('/export-persona', (msg) => {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id

    db.getDefaultedPinnedOrCurrentPersona(team_id, channel_id, (err, persona) => {
      if (err || !persona) {
        if (err) console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I had a problem loading your persona to export.'
        })
      }

      db.getSayings(team_id, persona.id, (err, sayings) => {
        if (err || !persona) {
          console.log(err)
          return msg.respond({
            response_type: 'ephemeral',
            text: 'I had a problem loading your sayings to export.'
          })
        }

        if ((sayings || []).length === 0) {
          return msg.respond({
            response_type: 'ephemeral',
            text: `I couldn't find any sayings to exports for ${persona.id}`
          })
        }

        msg.respond({
          response_type: 'ephemeral',
          text: `Here's your exported sayings for ${persona.id}\n \`\`\`${JSON.stringify(sayings, null, 4)}\`\`\``
        })
      })
    })
  })

  slapp.command('/set-persona-name', (msg) => {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id
    var new_persona_name = msg.body.text.trim()

    db.getPinnedOrCurrentPersona(team_id, channel_id, (err, persona) => {
      if (err || !persona) {
        if (err) console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'Sorry, I had an issue getting your persona.'
        })
      }

      persona.name = new_persona_name
      db.savePersona(team_id, persona, (err) => {
        if (err) {
          console.log(err)
          return msg.respond({
            response_type: 'ephemeral',
            text: 'Sorry, I had an issue updating your persona.'
          })
        }

        msg.respond({
          response_type: 'ephemeral',
          text: `From now on I shall be called Dr. ${new_persona_name}`
        })
      })
    })
  })

  slapp.command('/set-persona-icon-url', (msg) => {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id
    var new_persona_icon_url = msg.body.text.trim()

    db.getPinnedOrCurrentPersona(team_id, channel_id, (err, persona) => {
      if (err || !persona) {
        if (err) console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'Sorry, I had an issue getting your persona.'
        })
      }

      persona.icon = new_persona_icon_url
      db.savePersona(team_id, persona, (err) => {
        if (err) {
          console.log(err)
          return msg.respond({
            response_type: 'ephemeral',
            text: 'Sorry, I had an issue updating your persona.'
          })
        }

        msg.respond({
          response_type: 'ephemeral',
          text: `From now on I shall use a new icon - ${new_persona_icon_url}`
        })
      })
    })
  })

  slapp.command('/demo-setting', (msg) => {
    var team_id = msg.meta.team_id
    var setting = msg.body.text.trim()

    var key = setting.substring(0, setting.indexOf(' ')).trim()
    var value = setting.substring(setting.indexOf(' ')).trim()
    console.log(`Saving key, value: [${key}],[${value}]`)

    db.saveSetting(team_id, key, value, (err) => {
      if (err) {
        console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I had a problem saving your setting.'
        })
      }

      msg.respond({
        response_type: 'ephemeral',
        text: `I saved your setting: ${key}=${value}`
      })
    })
  })

  // TODO: finish this
  slapp.command('/persona-set-notification', (msg) => {
    var setting = msg.body.text.trim()
    var key = setting.substring(0, setting.indexOf(' ')).trim()
    var interval = setting.substring(setting.indexOf(' '), setting.indexOf('\n')).trim()
    var bot_say = setting.substr(setting.indexOf('\n') + 1)
    console.log(`Saving notification key, interval, bot_say - [${key}],[${interval}],[${bot_say}]`)
    // TODO: create new notification db functions for storage
  })

  slapp.command('/pin-persona', (msg) => {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id

    db.getCurrentPersona(team_id, (err, persona) => {
      if (err) {
        console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I had a problem looking up the current persona.'
        })
      }

      if (!persona) {
        return msg.respond({
          response_type: 'ephemeral',
          text: 'Could not pin empty persona'
        })
      }

      db.pinPersona(team_id, channel_id, persona.id, (err) => {
        if (err) {
          console.log(err)
          return msg.respond({
            response_type: 'ephemeral',
            text: 'I had a problem pinning that persona.'
          })
        }

        msg.respond({
          response_type: 'ephemeral',
          text: `Saving persona: ${persona.id}, channel: ${channel_id}`
        })
      })
    })
  })

  slapp.command('/unpin-persona', (msg) => {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id

    db.unpinPersona(team_id, channel_id, (err) => {
      if (err) {
        console.log(err)
        return msg.respond({
          response_type: 'ephemeral',
          text: 'I had a problem unpinning that persona.'
        })
      }

      msg.respond({
        response_type: 'ephemeral',
        text: `Unpinned ${channel_id}`
      })
    })
  })
}

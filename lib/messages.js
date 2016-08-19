var compose = require('./compose')
var helpText = require('./help-text')
var cleanKey = require('./clean-key')

module.exports = (slapp, data) => {
  // can't do this w/o some updates to slapp so we don't ignore bot messages
  // slapp.event('bot_channel_join', function (bot, message) {
  //   bot.reply(message, ":wave: team -  I am your demo bot. \n I support direct mentions and DMs, I will read what is in this channel and try to respond accordingly -  you can also `@demobot: help` me.")
  // })

  slapp.message('interactive', 'direct_message', (msg) => {
    msg.say({
      text: '',
      attachments: [
        {
          title: 'Do you want to interact with my buttons?',
          callback_id: 'yesno_callback',
          attachment_type: 'default',
          actions: [
            {
              'name': 'yes',
              'text': 'Yes',
              'value': 'yes',
              'type': 'button'
            },
            {
              'name': 'no',
              'text': 'No',
              'value': 'no',
              'type': 'button'
            }
          ]
        }
      ]
    })
  })

  // receive an interactive message, and reply with a message that will replace the original
  slapp.action('yesno_callback', (msg) => {
    var actions = msg.body.actions
    msg.respond(`got message id *${msg.body.callback_id}* and actions \`\`\`${JSON.stringify(actions)}\`\`\``)
  })

  slapp.message('^hello$', ['direct_message', 'direct_mention', 'ambient'], (msg) => {
    data.getDefaultedPinnedOrCurrentPersona(msg.meta.team_id, msg.meta.channel_id, (err, persona) => {
      if (err) {
        console.log(err)
      }

      msg.say(compose(persona, `:wave: I am ${persona.name}`))
    })
  })

  slapp.message('^help$', ['direct_message', 'direct_mention'], (msg) => {
    msg.say(helpText)
  })

  slapp.message('^export yourself$', ['direct_message', 'direct_mention'], (msg) => {
    data.getDefaultedPinnedOrCurrentPersona(msg.meta.team_id, msg.meta.channel_id, (persona) => {
      // var loading = persona.id + '_voc/'
      console.log('Loading vocabulary: ')

      data.loadVocabulary(persona.id, (err, val) => {
        if (err) {
          console.log(err)
          return msg.say('cannot load vocabulary')
        }

        console.log('got value', val)

        var call_config = {
          token: msg.meta.bot_token,
          filename: `persona_export_${persona.name}.txt`,
          content: JSON.stringify(val),
          filetype: 'text',
          channels: msg.meta.channel_id
        }

        slapp.client.files.upload(call_config, (err, res) => {
          if (err) {
            console.log(err)
            return msg.say('cannot export!')
          }
        })
      })
    })
  })

  // catch-all to check to see if we have a response
  slapp.message(/([/s/S])*/m, ['direct_message', 'direct_mention', 'ambient'], (msg) => {
    var team_id = msg.meta.team_id
    var channel_id = msg.meta.channel_id
    var saying_id = cleanKey(msg.body.event.text)
    console.log('saying: ', msg.body.event.text, saying_id)

    data.getDefaultedPinnedOrCurrentPersona(team_id, channel_id, function (err, persona) {
      if (err) {
        return console.log(err)
      }

      console.log(`Loading response for team=${team_id} persona=${persona.id}, key=${saying_id}`)
      data.getSaying(team_id, persona.id, saying_id, (err, saying) => {
        if (err) {
          return console.log(err)
        }

        if (!saying || !saying.botsay) {
          console.log(`what should I say when you say "${saying_id}"`)
          if (!msg.isAmbient()) {
            msg.say(compose(persona, `what should I say when you say "${saying_id}"? not sure... \n Please use \`/learn\` to teach me new tricks!`))
          }
          return
        }

        msg.say(compose(persona, saying.botsay.toString(), saying.attachments))
      })
    })
  })
}

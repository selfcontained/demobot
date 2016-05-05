var Botkit = require('botkit')
var http = require('http')

// Expect a SLACK_TOKEN environment variable


var controller = Botkit.slackbot()
var con = require('beepboop-botkit').start(controller)
var kv = require('beepboop-persist')()


//bot.startRTM(function (err, bot, payload) {
//  if (err) {
//    throw new Error('Could not connect to Slack')
//  }
//})

var morgan = require('morgan')

controller.setupWebserver(process.env.PORT,function(err,webserver) {
  controller.createWebhookEndpoints(webserver);
});

controller.on('slash_command', function (bot, message) {
  console.log('Here is the actual slash command used: ', message.command);
  bot.reply(message, ':wave:')
  //defineWord(bot, message, 2);
});


con.on('add_resource', function (message) {
  var slackTeamId = message.resource.SlackTeamID
  var slackUserId = message.resource.SlackUserID
  console.log('Got to A! add_resource', slackTeamId, slackUserId, message)

  if (message.isNew && slackUserId) {
    console.log('Got to B ', slackUserId);
    var bot = con.botByTeamId(slackTeamId)
    if (!bot) {
      return console.log('Error looking up botkit bot for team %s', slackTeamId)
    }

    console.log('starting private conversation with ', slackUserId)
    //bot.api.im.open({user: slackUserId}, function (err, response) {
     // if (err) return console.log(err)
     // var dmChannel = response.channel.id
     // bot.say({channel: dmChannel, text: 'I am the most glorious bot to join your team'})
     // bot.say({channel: dmChannel, text: 'You must now /invite me to a channel so that I may show everyone how dumb you are'})
    //})
    bot.startPrivateConversation({user: slackUserId},function(err,convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say(':wave: I am the Words bot that has just joined your team');
        convo.say('You can now /invite me to a channel so that I can be of use to the team or DM/@wordsbot me anytime!');
      }
    });


  }else{
    console.log('Did not go to B ', slackUserId);
  }
})

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "Hello team :wave: I am your WordsBot - give me a word and I will provide you with Definition and Synonyms. \n I support direct mentions and DMs, I will not read what is in this channel,  you will need to `@wordsbot: word-you-are-looking-for` me.")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, ':wave:')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  var ds = kv.get("hello", function (err, val) {})
  bot.reply(message, 'Hello. '+ds)
  bot.reply(message, 'It\'s nice to talk to you directly. Give me a word and I will provide you with Definition and Synonyms')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'what should I say?')

})


controller.hears('meta-help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`DM` me with a word.\n' +
      '`@wordsbot:` with a word.\n' +
      '`/define` with a word (this way only you see the results).\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})




controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'I really don\'t  know what to say here, can you tell me my line?');
})


controller.on('create_bot',function(bot,config) {


      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });

});



function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
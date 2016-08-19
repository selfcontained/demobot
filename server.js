var express = require('express')
var Slapp = require('slapp')
var BBContext = require('slapp-context-beepboop')
var BBConvo = require('slapp-convo-beepboop')

var PORT = process.env.PORT || 3000

var slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  context: BBContext(),
  convo_store: BBConvo()
})

var data = require('./lib/data')({})

require('./lib/commands')(slapp, data)
require('./lib/messages')(slapp, data)

var server = slapp.attachToExpress(express())

server.listen(PORT, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log('http server started on port %s', PORT)
})

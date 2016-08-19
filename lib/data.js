const firebase = require('firebase')
const path = require('path')
const fs = require('fs')

var DEFAULT_PERSONA = {id: 'default', name: 'Demo Bot', icon: 'http://lorempixel.com/48/48'}

module.exports = (config) => {
  var firebaseFileName = process.env.FIREBASE_FILE_NAME || '.firebase.json'
  var firebaseCredentials = process.env.FIREBASE_CREDENTIALS || ''
  var firebaseDatabaseURL = process.env.FIREBASE_DATABASE_URL || ''

  var loc = path.resolve(__dirname, '..', firebaseFileName)
  var buf = new Buffer(firebaseCredentials, 'base64')
  fs.writeFileSync(loc, buf.toString('utf8'))

  firebase.initializeApp({
    serviceAccount: loc,
    databaseURL: firebaseDatabaseURL
  })

  var database = firebase.database()

  var db = {

    setCurrentPersona (teamId, personaId, done) {
      database.ref(`teams/${teamId}/current-persona`).set(personaId, done)
    },

    getCurrentPersona (teamId, done) {
      database.ref(`teams/${teamId}/current-persona`).once('value', (snapshot) => {
        if (!snapshot) {
          return done(null, null)
        }

        var personaId = snapshot.val()
        if (!personaId) {
          return done(null, null)
        }

        // Load and return persona
        db.getPersona(teamId, personaId, done)
      }, done)
    },

    pinPersona (teamId, channelId, personaId, done) {
      database.ref(`teams/${teamId}/pinned-personas/${channelId}`).set(personaId, done)
    },

    unpinPersona (teamId, channelId, done) {
      database.ref(`teams/${teamId}/pinned-personas/${channelId}`).remove(done)
    },

    getPinnedPersona (teamId, channelId, done) {
      database.ref(`teams/${teamId}/pinned-personas`).once('value', (snapshot) => {
        if (!snapshot) {
          return done(null, null)
        }

        var pinnedPersonas = snapshot.val() || {}
        if (!pinnedPersonas[channelId]) {
          return done(null, null)
        }

        // Load and return pinned persona
        db.getPersona(teamId, pinnedPersonas[channelId], done)
      }, done)
    },

    savePersona (teamId, persona, done) {
      database.ref(`teams/${teamId}/personas/${persona.id}`).set(persona, done)
    },

    getPersona (teamId, personaId, done) {
      database.ref(`teams/${teamId}/personas/${personaId}`).once('value', (snapshot) => {
        done(null, snapshot.val())
      }, done)
    },

    getPersonas (teamId, done) {
      database.ref(`teams/${teamId}/personas`).once('value', (snapshot) => {
        done(null, snapshot.val())
      }, done)
    },

    getPinnedOrCurrentPersona (teamId, channelId, done) {
      db.getPinnedPersona(teamId, channelId, (err, persona) => {
        // found pinned persona or had an error, return
        if (err || persona) {
          return done(err, persona)
        }

        // lookup and return current persona
        db.getCurrentPersona(teamId, (err, persona) => {
          // return current persona, or default
          done(err, persona)
        })
      })
    },

    getDefaultedPinnedOrCurrentPersona (teamId, channelId, done) {
      db.getPinnedOrCurrentPersona(teamId, channelId, (err, persona) => {
        done(err, persona || DEFAULT_PERSONA)
      })
    },

    saveSetting (teamId, key, value, done) {
      database.ref(`teams/${teamId}/settings/${key}`).set(value, done)
    },

    saveSaying (teamId, personaId, saying, done) {
      database.ref(`teams/${teamId}/persona-sayings/${personaId}/${saying.id}`).set(saying, done)
    },

    getSaying (teamId, personaId, sayingId, done) {
      database.ref(`teams/${teamId}/persona-sayings/${personaId}/${sayingId}`).once('value', (snapshot) => {
        done(null, snapshot.val())
      }, done)
    },

    getSayings (teamId, personaId, done) {
      database.ref(`teams/${teamId}/persona-sayings/${personaId}`).once('value', (snapshot) => {
        done(null, snapshot.val())
      }, done)
    }

  }

  return db
}

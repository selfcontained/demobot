# demobot
scriptable slack bot for demos

Expects the following environment variables:

`FIREBASE_CREDENTIALS`: Base64 encoded string of a JSON Firebase service account key.  This is decoded, and passed into the `firebase.initializeApp()` call.
`FIREBASE_DATABASE_URL`: URL for your Firebase Database

To run locally, you can create an `env.sh` file with the contents of those values for testing, and source it before running `npm start`

```bash
export FIREBASE_CREDENTIALS="<Base64 Encoded JSON string>"
export FIREBASE_DATABASE_URL="https://<your-db-name>.firebaseio.com"
```

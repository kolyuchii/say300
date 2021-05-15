require('firebase-functions/lib/logger/compat');
const {DATA_BASE_URL} = require('./src/config');
const admin = require('firebase-admin');
admin.initializeApp({
    databaseURL: DATA_BASE_URL,
});
exports.checkTweets = require('./src/check-tweets').checkTweets;

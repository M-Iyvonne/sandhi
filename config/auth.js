// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '377938202593271', // your App ID
        'clientSecret'    : 'df2185e4a884796e14bdafc4dfaa01fd', // your App Secret
        'callbackURL'     : 'https://sandhiyoga.herokuapp.com/auth/facebook/callback',
        // 'http://localhost:8080/auth/facebook/callback',
        'profileURL'      : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '1085842123399-oc6ld59rojimidgheka1htk45ca44ka2.apps.googleusercontent.com',
        'clientSecret'     : '9edzQAqVuAq764Q_0cziMkcz',
        'callbackURL'      : 'http://localhost:8080/auth/google/callback'
    }

};

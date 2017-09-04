'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const bot = require('./bot.js');

const app = express();

app.set('port', (process.env.PORT || 8000));

// Parser application/x-www-form-urlencoded
app.user(bodyParser.urlencoded({extended:false}));
app.user(bodyParser.json());

// Index
app.get('/', (req, res) => {
  res.send('ShopRite Bot Deployed!!');
});

// For FaceBook verification
app.get('/webhook', function(req, res){
  if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN){
    console.log('Verified webhook');
    res.send(req.query['hub.challenge']);
  } else {
    console.error('Verification failed. The tokens do not mach.');
    res.sendStatus(403);
  }
});

// All callbacks for messenger will be POST-ed here
app.post('/webhook', (req, res) => {
  // Make sure this is a page subscription
  if (req.body.object == 'page') {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach((entry) => {
      // Iterate over each messaging event 
      entry.messaging.forEach((event) => {
        if (event.postback){
          bot.processPostback(event);
        }else if (event.message) {
          let message = event.message;
          if (message.quick_reply){
            bot.processQuickReply(event);
          }else {
            bot.processMessage(event);
          }
        }
      });
    });
    res.sendStatus(200);
  }
});

 // Fire up the server to listen
 app.listen(app.get('port'), () => {
  console.log('Running on port', app.get('port'));
});
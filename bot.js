const bodyParser = require('body-parser');
const request = require('request');
var _ = require('lodash');
const item = require('./item.js');
var jf = require('./utils/jsonfile.js');
var sanitise = require('./utils/sanitise.js');

var processPostback = (event) => {
  let senderId = event.sender.id;
  let payload = event.postback.payload;

  switch(payload){
    case 'GET_STARTED_PAYLOAD':
      // Get user's first name from the User Profile API
      // and include it in the Greeting message
      request({
        url : 'https://graph.facebook.com/v2.6/' + senderId,
        qs : {
          access_token : process.env.PAGE_ACCESS_TOKEN,
          fields:'first_name'
        },
        method: 'GET'
      }, (err, response, body) => {
          let greeting = '';
          if (err) {
            console.log("Error greeting user's name:" + err);
          }else{
            let bodyObj = JSON.parse(body);
            var name = bodyObj.first_name;
            greeting = `Hi ${name} !,`;
          }
          let message = `${greeting} I'm a bot, i will keep you up to date with the latest promotion and prices of all products.Go ahaed and type product to check all products prices`;
          item.sendMessage(senderId,{text:message});
      });
    break;
// Postback from the persistente menu
    case 'PRODUCTS':
      item.checkProducts(senderId);
    break;

    case 'PRODUCT_ON_PROMO':
      item.checkProductsOnPromo(senderId);
    break;

    case 'MY_SHOPPING_LIST':
      item.checkItemList(senderId);
    break;

    default:
    if (payload !=null) {
      var str = payload.split('-');
      var arg1 = str[0];
      var arg2 = str[1];
      var arg3 = str[2];
      var arg4 = str[3];
  
      console.log(`arg1 :${arg1} // arg1 :${arg2}// arg1 :${arg3}// arg1 :${arg4}`);
      switch(arg1){
        case 'ADD_TO_LIST':
        item.confirmAddToList(senderId, arg2, arg3, arg4);
        break;
  
        case 'DELETE_LIST':
              let messageData = {
              'text':'Confirm if you want to DELETE.',
              'quick_replies':[
                {
                  'content_type':'text',
                  'title':'Cancel',
                  'payload':'NO_DELETE_LIST'
                },
                {
                  'content_type':'text',
                  'title':'Delete',
                  'payload':'YES_DELETE_LIST'
                }
              ]
          }
  
          item.sendMessage(senderId, messageData);
        break;
  
        case 'YES_DELETE_LIST':
        item.deleteList(senderId);
            break;
        case 'NO_DELETE_LIST':
        item.sendMessage(senderId, {text:'You can add more items... '})
        item.checkProducts(senderId);
            break;
        case 'CREATE_SHOPPING_LIST':
        item.checkProducts(senderId);
            break;
        /*
        case 'PASS_ORDER_LIST':
            order.sendMessage(senderId, {text:'Please confirm your order?'})
            order.confirmListOrder(senderId);
            break;
            
        case 'YES_ORDER_LIST':
            order.passListOrder(senderId);
            order.shareLocation(senderId);
            break;
        case 'NO_ORDER_LIST':
          order.checkProducts(senderId);
            break;
        case 'ONE_PIZZA':
          order.confirmOrder(senderId, arg2);
            break;
        case 'MORE_PIZZA':
          order.sendMessage(senderId, {text:'I will added your PIZZA to the list, just type 'list' and order all of them 😊' });
          order.addToList(senderId,arg2)
          */
        }
      }
    break;
  };
 
    };

var processMessage = (event) => {
  if (!event.message.is_echo) {
    let message = event.message;
    let senderId = event.sender.id;

    console.log('Received message from senderId: ' + senderId);
    console.log('The message is: ' + JSON.stringify(message));

    // You may get an attachement or a text but not both
    if (message.text) {
      var formattedMsg = message.text.toLowerCase().trim();

       //Check if the json file contains an item to edit
      // var note = jf.getNote(senderId);
      // console.log('Json File here:', note);
      // if(typeof note.senderId !== 'undefined'){
      //   console.log("notes...",note);
      //   var botMsg = _.get(note,'item.botMsg');
      //   var itemId = _.get(note,'item.itemId');
      //   var itemName = _.get(note,'item.itemName');
      //   var itemPrice = _.get(note,'item.itemPrice');
      //   console.log(botMsg);
      //   // sanitise the user input so we only get the expected data type.
      //   sanitise.inputValidator(senderId, itemId, itemName, itemPrice, botMsg, formattedMsg);
      // }
      //Get the first name of user from the fb graph api.
      request({
        url: "https://graph.facebook.com/v2.6/" + senderId,
        qs: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
          fields: "first_name"
        },
        method: "GET"
      }, (error, response, body) => {
        if (error) {
          console.log("Error getting user's name: " + error);
        }else {
          let bodyObj = JSON.parse(body);
          var name = bodyObj.first_name;
          console.log(name)
          var userName = name;
        } 
      switch (formattedMsg) {
        
        // Greating key words
        case 'hi':
        case 'hey':
        item.sendMessage (senderId, {text:`Hi ${userName},I'm a bot, i will keep you up to date with the latest promotion and prices of all products.Go ahaed and type product to check all products prices.` });
        break;
        case 'hello':
        case 'helo':
        item.sendMessage (senderId, {text:`Hello ${userName}, am a robot i can show all products prices, just type products or help if you need my help.`});
        break;
        case 'how are you?':
        case 'how are you':
        item.sendMessage (senderId, {text:'Am fine, thanks for asking'});
        break;
        case "what's up?":
        case 'whats up':
        item.sendMessage (senderId, {text:'Am here waitting to help you'});
        break;
        case 'good morning':
        case 'good afternoon':
        case 'good evening':
        case 'good night':
        item.sendMessage (senderId, {text:'Hi there!'});
        break;
        // Questions abt me key words
        case 'who are you?':
        case 'who are u?':
        case 'who r u?':
        case 'who are you':
        case 'who are u':
        case 'who r u':
        item.sendMessage (senderId, {text:"Am a robot and i can show all products and prices just type 'products' to see all products and prices or 'help' if you need my help. "});
        break;
        // Thank you message
        case 'thank you':
        case 'thanks':
        item.sendMessage (senderId, {text:'You are welcome, am always here to help you '});
        break;
        // Emotion key words
        case 'i love you':
        case 'i like you':
        case 'love you':
        case 'like you':
        item.sendMessage (senderId, {text:'I have the same feeling for you...'});
        break;
       // Questions abt location key words
        case 'where are you':
        item.sendMessage (senderId, {text:'Am right here to help you...'});
       break;

        case 'product':
        case 'products':
        item.checkProducts(senderId);
          break;
        //List message
        case 'list':
        item.checkItemList(senderId);
        break
        //Help message
      case 'helps':
       case 'help':
       item.sendMessage (senderId, {text:'You can type \n\n•products: to see products \n•list : to see your shopping list\n•help : to see this help\n•promotion : to see all products on promotion\n•discount : to see all products on discount.'});
        break;
        default:
        item.sendMessage (senderId, {text:"Hummm...am confused, am still learning you know!! If you need help just type 'help'."});
          break;
      }
    });
    } else if (message.attachments){
      item.sendMessage(senderId, {text:'sorry i can not read that...'})
      /*
      // Get the 'type' and the location name
      var location = message.attachments;
      location.forEach(function(attachementObj){
        var title = attachementObj.title;
        var type = attachementObj.type;
        var payload = attachementObj.payload;

        if (type === 'location') {
            order.sendCoordonates(senderId, payload, title);
            
        }
        else {
          
           order.sendMessage(senderId, {text: 'Hmmm...I can not find your location'});
        }
      });
      */
    }
    
  }
};

var processQuickReply = (event) => {
  let message = event.message;
  if (message.quick_reply) {
        let payload = message.quick_reply.payload;
        let senderId = event.sender.id;
        var str = payload.split('-');
        var arg1 = str[0];
        var arg2 = str[1];
        var arg3 = str[2];
        var arg4 = str[3];
    
        console.log(`arg1 :${arg1} // arg2 :${arg2}// arg3 :${arg3}// arg4 :${arg4}`);

      switch(arg1){
        case "PRODUCT_CATEGORY":
            item.allProductCategory(senderId, arg2);
        break;
        case 'NO_ADD_TO_LIST':
          item.checkProducts(senderId);
          break;
        case 'YES_ADD_TO_LIST':
          item.askQtyItem(senderId, arg2, arg3, arg4);
        break;
        case 'MORE_ITEMS':
          var botMsg = 'Give me a number, how many.';
          // Then Write the message bot to the json note (question item qty).
          // var formattedBotMsg = botMsg.toLowerCase().trim();
          jf.addNote(senderId, arg2, arg3, arg4, botMsg);
          var checkNote = jf.getNote(senderId);
          console.log("Wrote to json file : ", checkNote);
          item.sendMessage(senderId,  {text:botMsg});
          break;
        case 'JUST_ONE_ITEM':
          var qty = 1;
          item.addToList(senderId, arg2, arg3, arg4, qty);
        break;
        case "DELETE_LIST":
              let messageData = {
              "text":"Confirm if you want to DELETE.",
              "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Cancel",
                  "payload":"NO_DELETE_LIST"
                },
                {
                  "content_type":"text",
                  "title":"Delete",
                  "payload":"YES_DELETE_LIST"
                }
              ]
          }

          item.sendMessage(senderId, messageData);
        break;
        
        case "YES_DELETE_LIST":
        item.deleteList(senderId);
            break;
        case "NO_DELETE_LIST":
        item.sendMessage(senderId, {text:"You can add more items... "})
        item.checkProducts(senderId);
            break;
        case "CREATE_PIZZA_LIST":
        item.checkProducts(senderId);
            break;
      /*
        case "PASS_ORDER_LIST":
            order.sendMessage(senderId, {text:"Please confirm your order?"})
            order.confirmListOrder(senderId);
            break;
     
        case "YES_ORDER_LIST":
            order.passListOrder(senderId);
            order.shareLocation(senderId);
            break;
        case "NO_ORDER_LIST":
          order.checkMenu(senderId);
            break;
        case "ONE_PIZZA":
          order.confirmOrder(senderId, arg2);
            break;
        case "MORE_PIZZA":
          order.sendMessage(senderId, {text:'I will added your PIZZA to the list, just type "list" and order all of them 😊' });
          order.addToList(senderId,arg2)
      */
      }
   }
};

module.exports = {
  processPostback,
  processMessage,
  processQuickReply
}
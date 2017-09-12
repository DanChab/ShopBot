const bodyParser = require('body-parser');
const request = require('request');
var _ = require('lodash');
const item = require('./item.js');

var processPostback = (event) => {
  let senderId = event.sender.id;
  let payload = event.postback.payload;

  if (payload === 'GET_STARTED_PAYLOAD'){
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
          greeting = `Hi ${name} ,`;
        }
        let message = `${greeting} am the ShopRite robot, I can show you products prices and notify you for promotions and discounts. Type 'product' to check products or 'help' to get help menue`;
        item.sendMessage(senderId,{text:message});
    });
  }
  if (payload !=null) {
    var str = payload.split('-');
    var strPayload = str[0];
    var itemId = str[1];

    console.log(`str_payload :${strPayload} // iD :${itemId}`);
    switch(strPayload){
      case 'ADD_TO_LIST':
      item.confirmAddToList(senderId, itemId);
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
    order.confirmOrder(senderId, itemId);
      break;
  case 'MORE_PIZZA':
    order.sendMessage(senderId, {text:'I will added your PIZZA to the list, just type 'list' and order all of them 😊' });
    order.addToList(senderId,itemId)
    */
  }
}
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
        item.sendMessage (senderId, {text:`Hi ${userName}, am the shoprite robot i can show all products prices, just type products or help if you need my help.` });
        break;
        case 'hello':
        case 'helo':
        item.sendMessage (senderId, {text:`Hello ${userName}, am the shoprite robot i can show all products prices, just type products or help if you need my help.`});
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
      item.senderId(senderId, {text:'sorry i can not read that...'})
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
        var strPayload = str[0];
        var categoryName = str[1];

        console.log(`str_payload :${strPayload} // Category :${categoryName}`);

      switch(strPayload){
        case "PRODUCT_CATEGORY":
            item.allProductCategory(senderId,categoryName);
        break;
        case 'YES_ADD_TO_LIST':
          item.askQtyItem(senderId);
        break;
        case 'MORE_ITEMS':
        item.askQtyItem(senderId);
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
        item.checkMenu(senderId);
            break;
        case "CREATE_PIZZA_LIST":
        item.checkMenu(senderId);
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
          order.confirmOrder(senderId, itemId);
            break;
        case "MORE_PIZZA":
          order.sendMessage(senderId, {text:'I will added your PIZZA to the list, just type "list" and order all of them 😊' });
          order.addToList(senderId,itemId)
      */
      }
   }
};

module.exports = {
  processPostback,
  processMessage,
  processQuickReply
}
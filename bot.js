const bodyParser = require('body-parser');
const request = require('request');
var _ = require('lodash');

var processPostback = (event) => {
  let senderId = event.sender.id;
  let payload = event.postback.payload;

  if (payload === 'GET_STARTED_PAYLOAD'){
    // Get user's first name from the User Profile API
    // and include it in the Greeting message
    request({
      url : "https://graph.facebook.com/v2.6/" + senderId,
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
        let message = `${greeting} am the ShopRite robot, I can show you products prices and notify you for promotions and discounts. Type "product" to check products or "help" to get help menue`;
        itemManager.sendMessage(senderId,{text:message});
    });
  }
  if (payload !=null) {
    var str = payload.split('-');
    var strPayload = str[0];
    var itemId = str[1];

    console.log(`str_payload :${strPayload} // iD :${itemId}`);
    switch(strPayload){
      case "ADD_ITEM_TO_LIST":
      order.sendMessage(senderId, {text:"You can add product to your shopping list."});
      order.checkMenu(senderId);
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

        order.sendMessage(senderId, messageData);
  break;

  case "YES_DELETE_LIST":
    order.deleteList(senderId);
      break;
  case "NO_DELETE_LIST":
    order.sendMessage(senderId, {text:"You can add more items... "})
    order.checkMenu(senderId);
      break;
  case "CREATE_PIZZA_LIST":
    order.checkMenu(senderId);
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
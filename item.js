const request = require('request');

// Sending message to user
var sendMessage = (recipientId, message) => {
  request({
    url:"https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message:message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}

var checkProducts = (senderId) => {

    var elements = [];
    request("https://rapid-resto.herokuapp.com/api/shoprite/prodCategory", (error, response, body) =>{
      if (!error && response.statusCode == 200) {
        let prodCtgArray = JSON.parse(body);
        console.log(prodCtgArray);
        // Looping through
        prodCtgArray.forEach(function(category){
          let idCtg = category._id;
          let nameCtg = category.cathegory;
          // Adding item to the elements array
          elements.push({  
              "content_type":"text",
              "title":nameCtg,
              "payload":"PRODUCT_CATEGORY-"+nameCtg
         });
        });
        console.log(elements);
        let messageData = {
          "text":"We have a variety of products...here are the categories 🤗 ",
         "quick_replies":
           elements
         
     }
     sendMessage(senderId, messageData);
      }
    });
  
  }

  var allProductCategory = (senderId, categoryName) => {
    var elements = [];
    var categoryName = categoryName.toLowerCase().trim();
    
    request({
      url : 'https://rapid-resto.herokuapp.com/api/shoprite/getAllProdCategory',
      method  : 'POST',
      body :  { categoryName:categoryName },
      json  : true
    }, function (error,response, body) {
      
      if (!error && response.statusCode == 200){
        var itemsArray = JSON.parse(body);
        console(body);
        console.log('********',itemsArray);
  
        itemsArray.forEach((itemObj) => {
          let itemName  = itemObj.name;
          let itemPrice = itemObj.price;
          let itemImg   = itemObj.image;
          let itemId    = itemObj._id;
          let common_name = itemObj.common_name;
  
           // Adding item to the elements array
           elements.push({
            "title": itemName + " " +itemPrice,
            "subtitle":  common_name,
            "image_url": itemImg,
            "buttons": [{
              "type": "postback",
              "title": "Order",
              "payload": "ORDER-"+itemId
            },
            {
              "type": "postback",
              "title": "Add To List",
              "payload": "ADD_TO_LIST-"+idItem
            }]
          });
        });
  
        let messageData = {
          "attachment":{
            "type": "template",
            "payload": {
              "template_type": "generic",
              elements
      }
     }
    }
  sendMessage(senderId, messageData);
  
      }
      
    });
  }

  module.exports = {
    sendMessage,
    allProductCategory,
    checkProducts
   
  }
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
          "text":"We have a variety of products...here are the categories  ",
         "quick_replies":
           elements     
     }
     sendMessage(senderId, messageData);
      }
    });
  }
var allProductCategory = (senderId, ctgName) => {
    var elements = [];
    var ctgName = ctgName.toLowerCase().trim();

    request(`https://rapid-resto.herokuapp.com/api/shoprite/prodCategory/ctg_name=${ctgName}`, (error,response, body) => {
      
      if (!error && response.statusCode == 200){
        var itemsArray = JSON.parse(body);
        console.log(itemsArray);
  
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
              "title": "Add To Shopping List",
              "payload": "ADD_TO_LIST-"+itemId
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
  };

var addToList = (senderId, itemId) => {
       request({
      url: "https://rapid-resto.herokuapp.com/api/products/addPizza",
      method: "POST",
      body: {
            userId: senderId,
            itemId : itemId,
      },
      json:true
    
    }, function(error, response, body){
      if (error) throw error;
      if (!error && response.statusCode == 200){
         sendMessage(senderId, {text: `${itemName} Added To List...😊`});
         checkMenu(senderId)
      }else {
        sendMessage (senderId, {text:"😖 Hoops, sorry i couldn't save this Pizza to your list!! Try again later..."})
      }
     
    });
    
      }
var confirmAddToList = (senderId, itemId) => {
    // First get item's details 
    request(`https://lumpus-backend.herokuapp.com/api/shoprite/shoppingList/itemDetails=${itemId}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let itemArray = JSON.parse(body);
        console.log(itemArray);
        itemArray.forEach((itemObj) => {
          var idItem = itemObj._id;
          var itemName = itemObj.name;
          var itemPrice = itemObj.price;
        });
        // Create quick reply template
          let messageData = {
            "text":'Do you want to add '+ itemName+ ' cost:'+itemPrice +' ?',
            "quick_replies":[
              {
                "content_type":"text",
                "title":'Yes',
                "payload":"YES_ADD_TO_LIST-"+idItem
            },
            {
              "content_type":"text",
              "title":'No',
              "payload":"NO_ADD_TO_LIST-"+idItem
          }]     
        }
        sendMessage(senderId, messageData);
        }else{
          sendMessage(senderId,{text:'😖😖Sorry try again later...'});
        };
      });
    };
      
module.exports = {
    sendMessage,
    allProductCategory,
    checkProducts,
    confirmAddToList
   
  }
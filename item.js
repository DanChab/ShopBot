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
              "payload":"CATEGORY-"+nameCtg
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

  module.exports = {
    checkProducts,
    sendMessage
  }
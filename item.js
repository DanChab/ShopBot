const request = require('request');
var jf = require('./utils/jsonfile.js');
var _ = require('lodash');

// Sending message to user
const sendMessage = (recipientId, message) => {
  request({
    url:"https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message:message,
    }
  }, (error, response, body) => {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}

const checkProducts = (senderId) => {
    var elements = [];
       request("https://lumpus-backend.herokuapp.com/api/shopBot/prodCategory", (error, response, body) =>{
      if (!error && response.statusCode == 200) {
        let prodCtgArray = JSON.parse(body);
        console.log(prodCtgArray);
        // Looping through
        prodCtgArray.forEach((category) => {
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
const allProductCategory = (senderId, ctgName) => {
    var elements = [];
    var ctgName = ctgName.toLowerCase().trim();

    request(`https://lumpus-backend.herokuapp.com/api/shopBot/prodCategory/ctg_name=${ctgName}`, (error,response, body) => {
      
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
const confirmAddToList = (senderId, itemId) => {
    // First get item's details 
    request(`https://lumpus-backend.herokuapp.com/api/shopBot/shoppingList/itemDetails=${itemId}`, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let itemArray = JSON.parse(body);
        console.log(itemArray);
        itemArray.forEach((itemObj) => {
          var itemId = itemObj._id;
          var itemName = itemObj.name;
          var itemPrice = itemObj.price;
       
        // Create quick reply template
          let messageData = {
            "text":`Do you want to add ${itemName} cost:${itemPrice} ?`,
            "quick_replies":[
              {
                "content_type":"text",
                "title":'Yes',
                "payload":`YES_ADD_TO_LIST-${itemId}-${itemName}-${itemPrice}`
            },
            {
              "content_type":"text",
              "title":'No',
              "payload":"NO_ADD_TO_LIST-"+itemId
          }]     
        }
        sendMessage(senderId, messageData);
      });
     }else{
          sendMessage(senderId,{text:'😖😖Sorry try again later...'});
        };
      });
    };
      
const askQtyItem = (senderId, arg2, arg3, arg4) => {
  let messageData = {
    "text":`How many do you want?`,
    "quick_replies":[
      {
        "content_type":"text",
        "title":'Just one',
        "payload":`JUST_ONE_ITEM-${arg2}-${arg3}-${arg4}`
    },
    {
      "content_type":"text",
      "title":'More',
      "payload":`MORE_ITEMS-${arg2}-${arg3}-${arg4}`
  }]     
  }
  sendMessage(senderId, messageData);
  };

const addToList = (senderId, itemId, itemName, itemPrice, itemQty) => {
    request({
    url: "https://lumpus-backend.herokuapp.com/api/shopBot/shoppingList",
    method: "POST",
    body: {
          userId : senderId,
          itemId : itemId,
          itemName :  itemName,
          itemPrice  : itemPrice,
          itemQty  : itemQty
    },
    json:true

    }, (error, response, body) =>{
    if (error) throw error;
    if (!error && response.statusCode == 200){
        sendMessage(senderId, {text: `Added To Shopping List...😊`});

        // Take the user back to check products
        checkProducts(senderId);
        //Delete the item form the json file
        jf.removeNote(senderId);
        checkProducts(senderId)
    }else {
      sendMessage (senderId, {text:"😖 Hoops, sorry i couldn't save this item to your list!! Try again later..."})
    }

    });

    }

const checkItemList = (senderId) => {
      var listItem = "";
      var total = 0;
      
      // Check if the user has a list
      request("https://lumpus-backend.herokuapp.com/api/shopBot/shoppingList/listId="+senderId, function(error, response, body){
        if (!error && response.statusCode == 200){
            var listArray = JSON.parse(body);
            if (listArray.length != 0) {
              listArray.forEach(function(listObj){
                var itemName = listObj.itemName;
                var itemPrice = listObj.itemPrice;
                var itemQty = listObj.itemQty;
                var itemPriceFloat = parseFloat(itemPrice.slice(1));
                var itemId = listObj._id;
                
                total += itemPrice*itemQty;

                
                listItem +="•"+itemName+"=> " + itemPrice+  itemQty+"\n";
              });
    
              let messageData = {
                   "text":"📝 SHOPPING LIST 📝 \n" +"------------------------------------"+"\n"+ listItem + "=============="+"\n"+"Total =k "+total,
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Add Item",
                      "payload":"ADD_ITEM_TO_LIST"
                    },
                    {
                      "content_type":"text",
                      "title":"Delete List",
                      "payload":"DELETE_LIST"
                    },
                    {
                      "content_type":"text",
                      "title":"Pass Order",
                      "payload":"PASS_ORDER_LIST"
                    }
                  ]
              }
              sendMessage(senderId, messageData);
            }
            else{
           let messageData = {
                  "text":"You have no ShoppingList!!.",
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Create Shopping List",
                      "payload":"CREATE_PIZZA_LIST"
                    }
                  ]
              }
              sendMessage(senderId, messageData);
        }
    
        }else{
          sendMessage(sendMessage, {text: "😕 Ooops something went wrong, allow me to check myself...be back in a moment"});
        }
    
      });
    }

const deleteList = (senderId) => {
      // request("https://rafikibot-api.herokuapp.com/api/products/shoppingListDel="+senderId, function(error, response, body){
      //   if (!error && response.statusCode == 200) {
      //     console.log("DELETED SUCCESSFUL");
      //   }
      // });
    
      request({
      url: "https://rafikibot-api.herokuapp.com/api/shopBot/shoppingList",
      method: "DELETE",
      body: { senderId: senderId },
      json:true
    
    }, (error, response, body) =>{
      if (error) throw error;
      if (!error && response.statusCode == 200){
           sendMessage(senderId, {text: " List deleted!"})
      }else{
        sendMessage (senderId, {text:" 😕 Sorry i could not delete your list, please try later"})
      }
      
    });
    }

const getPromoContent = (senderId) => {
    var elements = [];

    request("https://lumpus-backend.herokuapp.com/api/shopBot/getProductsPromo/promo", (error, response, body) => {
          if(!error && response.statusCode == 200){

            var promoData = JSON.parse(body);
            if(!_.isEmpty(promoData)) {
              var arrayObj = JSON.parse(body);
              console.log(JSON.stringify(arrayObj, undefined,2));
              arrayObj.forEach((promoDetails) => {
                var itemId = promoDetails._id;
                var dateFrom = promoDetails.dateFrom;
                var dateTo = promoDetails.dateTo;
                var promoImage = promoDetails.imageUrl;
                var description = promoDetails.description;
  
                var messageData = {
                    "attachment":{
                      "type":"video",
                      "payload":{
                        "url":promoImage
                      }
                    }
            };
            return sendMessage(senderId, messageData);
              });
            } else{
              sendMessage(senderId, {text:'No promotion yet, I will let know when we have...😊'});
            };         
          } else {
            return sendMessage(senderId, {text:'HOoops someting went wrong please try later...'});
          }
        }
      );
     // getPromoLikes(senderId);
};

const getPromoLikes = (senderId) =>{
  // Show the like message with a quick reply
    let messageData = {
      "text":"Do you like it? ",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"👍🏽",
          "payload":"LIKE_PROMO"
        },
        {
          "content_type":"text",
          "title":"👎",
          "payload":"DISLIKE_PROMO"
        }
      ]
    }
    return sendMessage(senderId, messageData);
    };

// const checkProductsOnPromo = async (senderId, msgText) => {
//   const promoContent = await getPromoContent(senderId);
//     console.log('Running promoContent');
//   const sendMsg = await sendMessage(senderId, msgText);
//   console.log('Running sendMsg');
//   const promoLikes = await getPromoLikes(senderId);
//   console.log('Running promoLikes');
//   console.log (`PromoContent:\n ${promoContent}  PromoLikes: \n ${promoLikes}`);
// };

const notification = (senderId, notificationStatus) => {

  console.log(`Data to post\n senderId: ${senderId} \n noticationStatus: ${notificationStatus}`);
  request({
    url:'https://lumpus-backend.herokuapp.com/api/shopBot/users/userNotifStatus',
    method:'POST',
    body:{
      notificationStatus: notificationStatus,
      senderId: senderId
    },
    json:true
  },(error, response, body) =>{
    if (!error && response.statusCode == 200){
      if (notificationStatus){
        return sendMessage(senderId, {text:'Notification turned On,you will be receiving promotion alerts and other announcements.'});
       }if (!notificationStatus){
        return sendMessage(senderId, {text:'Notification turn Off, if you want to check for promotion and other announcemenets, you can check it on products promotion menu.'});
       }
    }else {
      sendMessage(senderId, {text:'Hooops sorry someting went wrong, please try again later'})
    }
  });
}

const getUserDetails = (senderId, userName) => {
  request({
    url:'https://lumpus-backend.herokuapp.com/api/shopBot/users/userInfo',
    body: {
      userId: senderId,
      userName: userName
    },
    method: 'POST',
    json: true
  }, (error, response, body) => {
    if (!error && response.statusCode == 200){
        console.log('User details send to server success!!!');
    }else {
      console.error('Could not post user details to the seerver!!!');
    }
  });
};

module.exports = {
    sendMessage,
    allProductCategory,
    checkProducts,
    confirmAddToList,
    askQtyItem,
    addToList,
    checkItemList,
    deleteList,
    getPromoContent,
    getPromoLikes,
    notification,
    getUserDetails
  }
var validator = require('validator');
const item = require('../item.js');

var inputValidator = (senderId,itemId, itemName, itemPrice, botMsg, userInput) => {
  switch(botMsg){
    case "Give me a number, how many.":
      var itemQty = validator.isNumeric(userInput);
      if (itemQty){
        console.log("itemQty IS NUMBER");
        // send params to the api for addition to shopping list
        return item.addToList(senderId,itemId, itemName, itemPrice,  userInput);
        
      }else{
        console.log("itemQty IS NOT A NUMBER");
        item.sendMessage(senderId, {text: "Ooops that does not look like a valide number.."});
      }
      break;
  }
}

module.exports = {
  inputValidator
}


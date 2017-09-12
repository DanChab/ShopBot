var validator = require('validator');
const item = require('../item.js');

var inputValidator = (senderId, botMsg, userInput, itemId) => {
  switch(botMsg){
    case "Enter new price please.":
      var itemQty = validator.isNumeric(userInput);
      if (itemQty){
        console.log("itemQty IS NUMBER");
        // send params to the api for addition to shopping list
        item.addToList(senderId,itemId,itemQty,itemname);

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


const fs = require('fs');

var fetchNotes = () => {
  try {
    var notesString = fs.readFileSync('tmp/itemList.json');
    return JSON.parse(notesString);
  } catch (e) {
    return [];
  }
};

var saveNotes = (notes) => {
  fs.writeFileSync('tmp/itemList.json', JSON.stringify(notes));
};

var addNote = (senderId, arg, botMsg) => {
  var notes = fetchNotes();
  var note = {
    senderId:senderId,
    item:{
      arg:arg,
      botMsg:botMsg,
    }
  };
  // var duplicateNotes = notes.filter((note) => note.senderId === senderId);
  // if (duplicateNotes.length === 0) {
    notes.push(note);
    saveNotes(notes);
    return note;
 // }
};

var getNote = (senderId) => {
  var notes = fetchNotes();
  var filteredNotes = notes.filter((note) => note.senderId === senderId);
  return filteredNotes[0];
};

var removeNote = (senderId) => {
  var notes = fetchNotes();
  var filteredNotes = notes.filter((note) => note.senderId !== senderId);
  saveNotes(filteredNotes);

  return notes.length !== filteredNotes.length;
};

module.exports = {
  fetchNotes,
  saveNotes,
  addNote,
  getNote,
  removeNote
}
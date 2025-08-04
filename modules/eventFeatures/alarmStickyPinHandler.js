const crudHandler = require("../database/crudHandler");

function handleStickyPin(message) {
    // Is the sticky pin status set to false?
    // If yes, does the message mention the alarm? if not, return early
    // If the message does mention the alarm, set sticky pin status to true and send the message
    // . . .
    // Is the sticky pin status set to true?
    // If yes, get the message id of the last sent message, delete it, and resend it
}

module.exports = { handleStickyPin };

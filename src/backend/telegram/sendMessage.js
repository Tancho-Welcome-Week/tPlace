const Telegraf = require('telegraf');
const keys = require('../keys.js')

require('dotenv').config();
const bot = new Telegraf(keys.botToken);

const MORNING_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Wake up sleepy head! Your pixels are recharged!";
const LUNCH_NOTIFICATION_PIXEL_FULLY_RECHARGED = "While you are recharging, your pixels have recharged";
const DINNER_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Grab your dinner, buckle in and start canvasing, your " +
    "pixels are recharged!";
const NIGHT_NOTIFICATION_PIXEL_FULLY_RECHARGED = "It's quiet hours! Make full use of your remaining pixels and get some rest!";
const APOLOGY = 'Dear Tembusians of tPlace,\n\n' +

    'Due to a database error, the canvas featured in tPlace has unfortunately been reverted to the state it was in at around 5pm on the 30th of July. We understand that many projects, which were many pixels in the making, have unfortunately been reverted as well.\n\n' +

    "As our apologies for this, we have increased the maximum accumulated pixel count to 150, and have given each user 150 accumulated pixels as well.\n\n" +

    "Do use these accumulated pixels before the beta period ends on Sunday! We will be showing this canvas to the incoming batch during TWW, so do make the best pixel art that you can!\n\n" +

    "With apologies,\n" +
    "The tPlace Planning Committee"

const sendNotification = async (user, message) => {
    const chatId = user.telegram_id
    try {
        await bot.telegram.sendMessage(chatId, message);
    } catch (err) {
        console.log(err)
    }
}

const sendMessage = (user, message) => {
    try {
        sendNotification(user, message).then(r => {})
    } catch (err) {
        console.log(`${user} isn't real`)
    }
}

const sendMassMessage = (users, message) => {
    for(const user of users) {
        sendMessage(user, message)
    }
}

module.exports = {sendMassMessage}

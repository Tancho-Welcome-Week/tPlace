const Telegraf = require('telegraf');

require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const MORNING_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Wakeup sleepy head! Your pixels are recharged!";
const LUNCH_NOTIFICATION_PIXEL_FULLY_RECHARGED = "While you are recharging, your pixels have recharged";
const DINNER_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Grab your dinner, buckle in and start canvasing, your" +
    "pixels are recharged!";
const NIGHT_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Just because it's quiet hours, it doesn't mean you can't " +
    "get to pixeling! Your pixels are charged!";

const sendNotification = (user, message) => {
    const chatId = user.telegram_id
    bot.telegram.sendMessage(chatId, message);
}

exports.sendMorningRecharge = (user) => {
    sendNotification(user, MORNING_NOTIFICATION_PIXEL_FULLY_RECHARGED)
};

exports.sendLunchRecharge = (user) => {
    sendNotification(user, LUNCH_NOTIFICATION_PIXEL_FULLY_RECHARGED)
};

exports.sendDinnerRecharge = (user) => {
    sendNotification(user, DINNER_NOTIFICATION_PIXEL_FULLY_RECHARGED)
};

exports.sendNightRecharge = (user) => {
    sendNotification(user, NIGHT_NOTIFICATION_PIXEL_FULLY_RECHARGED)
};


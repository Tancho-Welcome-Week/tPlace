const Telegraf = require('telegraf');
const keys = require('../../keys.js')

require('dotenv').config();
const bot = new Telegraf(keys.botToken);

const MORNING_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Wake up sleepy head! Your pixels are recharged!";
const LUNCH_NOTIFICATION_PIXEL_FULLY_RECHARGED = "While you are recharging, your pixels have recharged";
const DINNER_NOTIFICATION_PIXEL_FULLY_RECHARGED = "Grab your dinner, buckle in and start canvasing, your " +
    "pixels are recharged!";
const NIGHT_NOTIFICATION_PIXEL_FULLY_RECHARGED = "It's quiet hours! Make full use of your remaining pixels and get some rest!";

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


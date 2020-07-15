const Telegraf = require('telegraf');

require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const NOTIFICATION_PIXEL_READY = "A pixel is now ready to be plotted!";
const NOTIFICATION_PIXEL_FULLY_RECHARGED = "Your pixels are fully recharged! Logon now to plot your pixels!";

const sendPixelReadyNotification = (user) => {
    const chatId = user.chatId;
    bot.telegram.sendMessage(chatId, NOTIFICATION_PIXEL_READY);
};

const sendPixelRechargedNotification = (user => {
    const chatId = user.chatId;
    bot.telegram.sendMessage(chatId, NOTIFICATION_PIXEL_FULLY_RECHARGED);
});

const Telegraf = require('telegraf')

require('dotenv').config()
const bot = new Telegraf(process.env.BOT_TOKEN)
const gameShortName = process.env.GAME_SHORT_NAME
const appEntry = process.env.APP_ENTRY_POINT || 'http://127.0.0.1:5000'

bot.start((ctx) => ctx.reply('Welcome to tPlace!'))
bot.help(ctx => ctx.reply('Use the /canvas command to start the game!'))

bot.command('canvas', (ctx) =>
    ctx.replyWithGame(gameShortName))

bot.on('callback_query', ctx => {
    const query = ctx.callbackQuery;
    if(!query || query.game_short_name !== gameShortName) {
        ctx.answerCbQuery("Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        console.log(query)
        const chatId = query.message.chat.id
        const userId = query.from.id
        let gameurl = `${appEntry}/${chatId}/${userId}`;
        ctx.answerGameQuery(gameurl);
    }
});

bot.on('inline_query', ctx => {
    ctx.answerInlineQuery([ { type: "canvas", id: "0", game_short_name: gameShortName } ]);
});

bot.launch().then(() => console.log('Bot running'))

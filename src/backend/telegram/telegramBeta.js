//For the Test Run
const Telegraf = require('telegraf')
const {MenuTemplate, MenuMiddleware} = require('telegraf-inline-menu')
const axios = require('axios')

require('dotenv').config()
const bot = new Telegraf(process.env.BOT_TOKEN)
const gameShortName = process.env.GAME_SHORT_NAME
const appEntry = process.env.APP_ENTRY_POINT || 'http://127.0.0.1:5000'

const menuTemplate = new MenuTemplate(
    ctx => `Hello ${ctx.update.message.chat.title || ctx.update.message.from.first_name}! Welcome to tplace!`)

// Configure menu template items
menuTemplate.interact('Start Drawing', 'draw', {
    do: (ctx) => {
        ctx.replyWithGame(gameShortName)
        return false
    }
})

menuTemplate.url('See Canvas', 'https://tww2020.site/tplace.html')

menuTemplate.url('See Instructions', 'https://docs.google.com/presentation/d/1PvEgIjDTDicbbiSd4Mj8fXBc6uV1n9qT9pmAv2R-OfI/edit?usp=sharing')

menuTemplate.url('Report Bug' , 'https://forms.gle/SLMbd9yzV8Q1C2St8')

menuTemplate.url('Send Feedback', 'https://forms.gle/WNqRHbrS6UjnqWnH7')

// menuTemplate.interact('Whitelist this Chat', 'whitelist', {
//     do: ctx => {
//         const chatId = ctx.update.callback_query.message.chat.id
//         const url = `${appEntry}/whitelist`
//         axios.post(url, {chatId: chatId})
//             .then(res => {
//                 if (res.status === 200) {
//                     ctx.reply('This chat group has been successfully whitelisted!')
//                 } else {
//                     ctx.reply('Uh oh looks like the whitelist period is up. Contact @Khairoulll for more info')
//                 }
//             })
//             .catch(err => {
//                 console.log(err)
//                 ctx.reply(`Unicorns! Looks like an error has occured. Contact @Khairoulll for more info`)
//             })
//         return false
//     }
// })

menuTemplate.interact('F', 'respect', {
    do: ctx => {
        ctx.reply('Your respect has been forwarded to the creators')
        const message = `${ctx.update.callback_query.from.first_name} has paid us compliments`
        ctx.telegram.sendMessage(-484684580, message)
        return false
    }
})


const menuMiddleware = new MenuMiddleware('/', menuTemplate)
bot.command('start', ctx => {
    menuMiddleware.replyToContext(ctx)
})
bot.use(menuMiddleware)

// configure commands
bot.help(ctx => ctx.reply('Use the /start command to start the game!'))

bot.command('tplace', (ctx) =>
    ctx.replyWithGame(gameShortName))

bot.command('off', ctx => {
    const userId = ctx.update.message.from.id
    const url = `${appEntry}/toggle/off`
    axios.post(url, {userId: userId})
        .then(res => {
            if (res.status == 200) {
                ctx.reply('Notification turned off successfully!')
            } else {
                ctx.reply('It seems you are not registered yet! Register on the bot using the Start Drawing button!')
            }
        })
        .catch(err => {
            console.log(err)
            ctx.reply(`Unicorns! Looks like an error has occured. Contact @Khairoulll for more info`)
        })
})

bot.command('on', ctx => {
    const userId = ctx.update.message.from.id
    const url = `${appEntry}/toggle/on`
    axios.post(url, {userId: userId})
        .then(res => {
            if (res.status == 200) {
                ctx.reply('Notification turned on successfully!')
            } else {
                ctx.reply('It seems you are not registered yet! Register on the bot using the Start Drawing button!')
            }
        })
        .catch(err => {
            console.log(err)
            ctx.reply(`Unicorns! Looks like an error has occured. Contact @Khairoulll for more info`)
        })
})

// bot.command('whitelist', (ctx) => {
//     const chatId = ctx.update.message.chat.id
//     const url = `${appEntry}/whitelist`
//     axios.post(url, {chatId: chatId})
//         .then(res => {
//             if (res.status === 200) {
//                 ctx.reply('This chat group has been successfully whitelisted!')
//             } else {
//                 ctx.reply('Uh oh looks like the whitelist period is up. Contact @Khairoulll for more info')
//             }
//         })
//         .catch(err => {
//             ctx.reply(`Unicorns! Looks like an error has occured. Contact @Khairoulll for more info`)
//         })
// })

// bot.command('f', (ctx) => {
//     ctx.reply('Your respect has been forwarded to the creators')
//     const message = `${ctx.update.message.from.first_name} has paid us compliments`
//     ctx.telegram.sendMessage(-484684580, message)
// })


bot.on('callback_query', ctx => {
    const query = ctx.callbackQuery;
    if(!query || query.game_short_name !== gameShortName) {
        ctx.answerCbQuery("Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        const chatId = query.message.chat.id
        const userId = query.from.id
        let gameurl = `${appEntry}/start/${chatId}/${userId}`;
        ctx.answerGameQuery(gameurl);
    }
});

bot.on('inline_query', ctx => {
    ctx.answerInlineQuery([ { type: "canvas", id: "0", game_short_name: gameShortName } ]);
});

bot.launch().then(() => console.log('Bot running'))

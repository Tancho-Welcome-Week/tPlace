const express = require('express')
const auth = require('./auth')

const app = express()
const port = process.env.PORT || 5000

app.get('/auth/:chatId/:userId', async (req, res, next) => {
    const chatId = req.params.chatId
    const userId = req.params.userId
    if (!auth.authenticateChatId(chatId)) {
        res.send('Invalid Chat Id') //todo: proper headers
        return
    }
    let user = auth.getUser(userId) // make asynchronous to utilise await?
    if (!user) {
        user = auth.createUser(userId)
    }
    res.redirect('https://www.reddit.com/') // todo: redirect to actual site with params
})

app.listen(port)
console.log(`App listening at Port ${port}`)

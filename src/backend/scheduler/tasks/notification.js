const message = require('./message')
const db = require('../../queries')

exports.sendMorningNotifications = async () => {
    const users = await db.getUsersWithNotifications()
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendMorningRecharge(user)
        }
    }
}

exports.sendLunchNotifications = async () => {
    const users = await db.getUsersWithNotifications()
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendLunchRecharge(user)
        }
    }
}

exports.sendDinnerNotifications = async () => {
    const users = await db.getUsersWithNotifications()
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendDinnerRecharge(user)
        }
    }
}

exports.sendNightNotifications = async () => {
    const users = await db.getUsersWithNotifications()
    console.log(users)
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendNightRecharge(user)
        }
    }
}
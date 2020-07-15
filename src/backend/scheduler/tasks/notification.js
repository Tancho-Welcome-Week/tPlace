const message = require('message')

exports.sendMorningNotifications = (users) {
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendMorningRecharge(user)
        }
    }
}

exports.sendLunchNotifications = (users) {
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendLunchRecharge(user)
        }
    }
}

exports.sendDinnerNotifications = (users) {
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendDinnerRecharge(user)
        }
    }
}

exports.sendNightNotifications = (users) {
    const currTime = Date.now()
    for (const user of users) {
        // minusing 5 minutes of the current time
        if (currTime - 300000 >= user.last_updated) {
            message.sendNightRecharge(user)
        }
    }
}
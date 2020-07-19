const {scheduleJob} = require('node-schedule');
const {sendNightNotifications,
    sendDinnerNotifications,
    sendLunchNotifications,
    sendMorningNotifications} = require('./tasks/notification');

const startNotificationSchedule = (users) => {

    scheduleJob('* 30 9 * *', () => {
        sendMorningNotifications(users);
    })

    scheduleJob('* 30 12 * *', () => {
        sendLunchNotifications(users);
    })

    scheduleJob('* 30 19 * *', () => {
        sendDinnerNotifications(users);
    })

    scheduleJob('* 0 23 * *', () => {
        sendNightNotifications(users);
    })

}

module.exports = startNotificationSchedule

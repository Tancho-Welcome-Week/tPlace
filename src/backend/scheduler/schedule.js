import {scheduleJob} from "node-schedule";

const schedule = require('node-schedule')
const notification = require('tasks/notification')

const startNotificationSchedule = (users) => {

    scheduleJob('* 30 9 * *', () => {
        notification.sendMorningNotifications(users);
    })

    scheduleJob('* 30 12 * *', () => {
        notification.sendLunchNotifications(users);
    })

    scheduleJob('* 30 19 * *', () => {
        notification.sendDinnerNotifications(users);
    })

    scheduleJob('* 0 23 * *', () => {
        notification.sendNightNotifications(users);
    })

}

module.exports = startNotificationSchedule

// import {scheduleJob} from "node-schedule";

const schedule = require('node-schedule');
const notification = require('./tasks/notification.js')

const startNotificationSchedule = (users) => {

    schedule.scheduleJob('30 9 * * *', () => {
        notification.sendMorningNotifications(users);
    })

    schedule.scheduleJob('30 12 * * *', () => {
        notification.sendLunchNotifications(users);
    })

    schedule.scheduleJob('30 19 * * *', () => {
        notification.sendDinnerNotifications(users);
    })

    schedule.scheduleJob('0 23 * * *', () => {
        notification.sendNightNotifications(users);
    })

}

module.exports = startNotificationSchedule

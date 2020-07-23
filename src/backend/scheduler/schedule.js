// import {scheduleJob} from "node-schedule";

const schedule = require('node-schedule');
const notification = require('./tasks/notification.js')

const startNotificationSchedule = async () => {

    schedule.scheduleJob('30 9 * * *', () => {
        notification.sendMorningNotifications();
    })

    schedule.scheduleJob('30 12 * * *', () => {
        notification.sendLunchNotifications();
    })

    schedule.scheduleJob('30 19 * * *', () => {
        notification.sendDinnerNotifications();
    })

    schedule.scheduleJob('0 23 * * *', () => {
        notification.sendNightNotifications();
    })
}

module.exports = startNotificationSchedule

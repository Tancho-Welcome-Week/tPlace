// import {scheduleJob} from "node-schedule";

const schedule = require('node-schedule');
const notification = require('./tasks/notification.js')

const startNotificationSchedule = async () => {

    schedule.scheduleJob('30 1 * * *', () => {
        notification.sendMorningNotifications();
    })

    schedule.scheduleJob('30 4 * * *', () => {
        notification.sendLunchNotifications();
    })

    schedule.scheduleJob('30 11 * * *', () => {
        notification.sendDinnerNotifications();
    })

    schedule.scheduleJob('0 15 * * *', () => {
        notification.sendNightNotifications();
    })
}

module.exports = startNotificationSchedule

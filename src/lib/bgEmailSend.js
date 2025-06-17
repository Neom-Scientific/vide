import {main} from './sendRegistrationMail.js';

function getMsUntil(targetHour , targetMinute = 0){
    const now = new Date();
    const target = new Date(now);
    target.setHours(targetHour, targetMinute, 0, 0);
    if (target < now) {
        target.setDate(target.getDate() + 1); // Move to next day if target time is in the past
    }
    return target.getTime() - now.getTime();
}

export function scheduleEmail() {
    const ms = getMsUntil(18,0);
    setTimeout(async()=>{
        await main();
        scheduleEmail();
    },ms);
}

scheduleEmail();


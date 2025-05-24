import { fetchLocations } from "./api/fetchLocations.js";
import { fetchOpenSlots } from "./api/fetchOpenSlots.js";
import { createNotification } from "./lib/createNotifications.js";

const ALARM_JOB_NAME = "DROP_ALARM";

let cachedPrefs = {};
let firstAppointmentTimeStamp = null;

chrome.runtime.onInstalled.addListener(details => {
    fetchLocations();
    handleOnStop();
})

chrome.runtime.onMessage.addListener(data =>{
    const{event, prefs} = data;
    switch(event){
        case "onStop":
            handleOnStop();
            break;
        case "onStart":
            handleOnSTart(prefs);
            break;
        default:
            break;
    }
})

chrome.notifications.onClicked.addListener( () => {
    chrome.tabs.create({url : "https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=up"})
})

chrome.alarms.onAlarm.addListener(() => {
    openSlotsJob();
})

const handleOnStop = () =>{
    cachedPrefs = {};
    firstAppointmentTimeStamp = null;
    setRunningStatus(false);
    stopAlarm();
}

 
const handleOnSTart = (prefs) => {
    chrome.storage.local.set(prefs);
    cachedPrefs = prefs;
    setRunningStatus(true);
    createAlarm();
}

const setRunningStatus = (isRunning) => {
    chrome.storage.local.set({isRunning});
}

const createAlarm = () => {
    chrome.alarms.get(ALARM_JOB_NAME, existingAlarm => {
        if(!existingAlarm){
            openSlotsJob();
            chrome.alarms.create(ALARM_JOB_NAME, {periodInMinutes: 1.0})
        }
    })
}

const stopAlarm = () => {
    chrome.alarms.clearAll();
}


const openSlotsJob = () => {
    fetchOpenSlots(cachedPrefs)
        .then(data => handleOpenSlots(data));
}

const handleOpenSlots = (openSlots) => {
    if(openSlots && openSlots.length > 0 && openSlots[0].timestamp != firstAppointmentTimeStamp){
        firstAppointmentTimeStamp = openSlots[0].timestamp;
        // create notificaion
        createNotification(openSlots[0], openSlots.length, cachedPrefs);
    }
}
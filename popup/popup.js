// ELEMENTS
const locationIdElement = document.getElementById("locationId")
const startDateElement = document.getElementById("startDate")
const endDateElement = document.getElementById("endDate")

// BUTTONS
const startButton = document.getElementById("startButton")
const stopButton = document.getElementById("stopButton")

// STATUS
const runningSpan = document.getElementById("runningSpan");
const stoppedSpan = document.getElementById("stoppedSpan");

// ERRORS
const locationIdError = document.getElementById("locationIdError");
const startDateError = document.getElementById("startDateError");
const endDateError = document.getElementById("endDateError");
const rangeError = document.getElementById("rangeError");

const hideElement = (elem) => {
    elem.style.display = 'none';
}

const showElement = (elem) => {
    elem.style.display = "";
}

const disableElement = (elem) => {
    elem.disabled = true;
}

const enableElement = (elem) => {
    elem.disabled = false;
}

const handleOnStopState = () => {
    // spans
    showElement(stoppedSpan);
    hideElement(runningSpan);
    // buttons
    disableElement(stopButton);
    enableElement(startButton);
    // inputs
    enableElement(locationIdElement);
    enableElement(startDateElement);
    enableElement(endDateElement);
}

const handleOnStartState = ()=>{
    // spans
    showElement(runningSpan);
    hideElement(stoppedSpan);
    //buttons
    disableElement(startButton);
    enableElement(stopButton);
    // inputs
    disableElement(locationIdElement);
    disableElement(startDateElement);
    disableElement(endDateElement);
}

const performOnStartValidation = () =>{
    if(!locationIdElement.value){
        showElement(locationIdError);
    }else {
        hideElement(locationIdError);
    }
    if(!startDateElement.value){
        showElement(startDateError);
    }else{
        hideElement(startDateError);
    }
    if(!endDateElement.value){
        showElement(endDateError);
    }else{
        hideElement(endDateError);
    }

    if(startDateElement.value && endDateElement.value){
        const sd = new Date(startDateElement.value);
        const ed = new Date(endDateElement.value);
        if(sd.getTime() > ed.getTime()){
            showElement(rangeError);
            return false;
        }else{
            hideElement(rangeError);
        }
    }else{
        hideElement(rangeError);
    }

    return locationIdElement.value && startDateElement.value && endDateElement.value;
}

startButton.onclick = () => {
    const validations = performOnStartValidation();
    if(validations){
        const prefs = {
            "locationId":locationIdElement.value,
            "startDate":startDateElement.value,
            "endDate":endDateElement.value,
            "tzData": locationIdElement.options[locationIdElement.selectedIndex].getAttribute('data-tz'),
        }
        handleOnStartState();
        chrome.runtime.sendMessage({event:"onStart", prefs});
    }
}

stopButton.onclick = () => {
    handleOnStopState();
    chrome.runtime.sendMessage({event:"onStop"});
}

chrome.storage.local.get(['locationId', 'startDate', 'endDate', 'locations', 'isRunning'], (result) => {
    const {locationId, startDate, endDate, locations, isRunning } = result;

    setLocations(locations);

    if(locationId){
        locationIdElement.value = locationId;
    }

    if(startDate){
        startDateElement.value = startDate;
    }

    if(endDate){
        endDateElement.value = endDate;
    }

    if(isRunning){
        handleOnStartState();
    }else{
        handleOnStopState();
    }
})

const setLocations = (locations) => {
    locations.forEach(location =>{
        let optionElement = document.createElement("option");
        optionElement.value = location.id;
        optionElement.innerHTML = location.name;
        optionElement.setAttribute('data-tz', location.tzData);
        locationIdElement.appendChild(optionElement);
    })
}

const today = spacetime.now().startOf('day').format();
startDateElement.setAttribute('min', today);
endDateElement.setAttribute('min', today);
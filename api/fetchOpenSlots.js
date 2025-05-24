export const fetchOpenSlots = (result) => {
    return new Promise((resolve, reject) => {
        const {locationId, startDate, endDate} = result;
        const appointmentUrl = `https://ttp.cbp.dhs.gov/schedulerapi/locations/${locationId}/slots?startTimestamp=${startDate}T00%3A00%3A00&endTimestamp=${endDate}T00%3A00%3A00`
        fetch(appointmentUrl)
            .then(response => response.json())
            .then(data => data.filter(slot => slot.active > 0))
            .then(data => resolve(data))
            .catch(error => {
                console.log(error);
                reject();
            }) 
    })
}
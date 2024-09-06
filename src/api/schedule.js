export async function fetchSchedule(stationId, timeFrom, timeTo){
    const url = `https://api-partner.krl.co.id/krlweb/v1/schedule?stationid=${stationId}&timefrom=${timeFrom}&timeto=${timeTo}`;
    const bearerToken = process.env.REACT_APP_BEARER_TOKEN;

    try {
        const response = await fetch(url, {
            headers: new Headers({
                'Authorization': `Bearer ${bearerToken}`
            })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();
        return jsonData.data; 
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return [];
    }
};

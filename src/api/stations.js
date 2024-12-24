export async function fetchAllStationNames() {
    const url = 'https://api-partner.krl.co.id/krl-webs/v1/krl-station';
    const bearerToken = process.env.REACT_APP_BEARER_TOKEN;

    try {
        const response = await fetch(url, {
            headers: new Headers({
                'Authorization': `Bearer ${bearerToken}`
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        return jsonData.data.map(function(station) {
            return {
                id: station.sta_id,
                name: station.sta_name,
                groupWil: station.group_wil,
                fgEnable: station.fg_enable
            };
        });
    } catch (error) {
        console.error('Error fetching station data:', error);
        return [];
    }
}

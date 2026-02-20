const REQ_TO_SEND = 100;
const URL = 'http://localhost:9926/risq/';
const hdb_username = '';
const hdb_password = '';


const HEADERS = {
    Authorization: `Basic ${Buffer.from(`${hdb_username}:${hdb_password}`).toString('base64')}`,
    'Content-Type': 'application/json'
};


async function main() {
    for (let i = 0; i < REQ_TO_SEND; i++) {
        try {
            const res = await fetch(URL + i, {
                method: 'GET',
                headers: HEADERS,
            });
            if (res.status !== 200) {
                const body = await res.text();
                console.log(res.status, URL + i, body);
            }
        } catch (error) {
            console.error('Request error:', error);
        }
    }
    console.log(`Get ${REQ_TO_SEND} records: complete`);
}

main();
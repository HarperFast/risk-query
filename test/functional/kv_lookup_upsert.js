import * as crypto from "node:crypto";


const REQ_TO_SEND = 100;
const URL = 'http://localhost:9926/risq/';
const hdb_username = '';
const hdb_password = '';


const HEADERS = {
    Authorization: `Basic ${Buffer.from(`${hdb_username}:${hdb_password}`).toString('base64')}`,
    'Content-Type': 'application/json'
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(items) {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
}


async function main() {
    for (let i = 0; i < REQ_TO_SEND; i++) {
        try {
            const res = await fetch(URL + i, {
                method: 'PUT',
                headers: HEADERS,
                body: JSON.stringify({
                    di: crypto.randomBytes(20).toString('hex'),
                    d: randomChoice(['allow', 'deny']),
                    r: randomInt(0, 100)
                })
            });

            if (res.status !== 204) {
                const body = await res.text();
                console.log(res.status, URL + i, body);
            }
        } catch (error) {
            console.error('Request error:', error);
        }
    }
    console.log(`Upsert ${REQ_TO_SEND} records: complete`);
}

main();
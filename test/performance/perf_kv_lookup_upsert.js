import http from "k6/http";
import {check} from "k6";
import {Trend} from "k6/metrics";
import {randomString, randomIntBetween, randomItem} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import execution from 'k6/execution';
import encoding from 'k6/encoding';


const hdb_username = '';
const hdb_password = '';
const CLUSTER_NODES = [
    "http://localhost:9926/risq/"
]
const HEADERS = {
    Authorization: `Basic ${encoding.b64encode(`${hdb_username}:${hdb_password}`)}`,
    'Content-Type': 'application/json'
};
const STAGES = [
    {target: 10, duration: '1s'},
    {target: 10, duration: '10s'}
];


let trendHDB = new Trend("trendHDB", true);

export let options = {
    setupTimeout: '900s',
    discardResponseBodies: false,
    summaryTrendStats: ["avg", "min", "max", "p(1)", "p(10)", "p(25)", "p(50)", "p(75)", "p(90)", "p(95)", "p(99)"],
    scenarios: {
        hdb: {
            executor: 'ramping-arrival-rate',
            exec: 'hdb',
            preAllocatedVUs: 100,
            maxVUs: 10000,
            stages: STAGES
        }
    },
};

export function hdb() {
    callHDB();
}

function callHDB() {
    const iterationId = execution.scenario.iterationInTest;
    let node_domain = randomItem(CLUSTER_NODES);
    let request_url = node_domain + iterationId;
    const data = {
        di: randomString(65),
        d: randomItem(['allow', 'deny']),
        r: randomIntBetween(0, 100)
    };

    const res = http.put(request_url, JSON.stringify(data), {headers: HEADERS});

    let serverTimingHeader = res.headers["Server-Timing"];
    let timings = serverTimingHeader.split(",");
    let matchHdb = serverTimingHeader.match(/hdb;dur=([\d.]+)/); // Match the specific timing
    if (matchHdb) {
        let duration = parseFloat(matchHdb[1]);
        trendHDB.add(duration);
    }
    if (res.status !== 204) {
        console.log(res.status, request_url, res.body);
    }
    check(res, {
        "status is 204": (r) => r.status == 204
    });
}
# Risk Query Key-Value Storage

## Overview

A lightweight Harper component that stores and serves real‑time risk decisions from Akamai Account Protector (APR) or any upstream fraud service. It solves the “Azure AD B2C won’t accept custom headers” problem by persisting the score in a low‑latency key‑value table that B2C can query directly.

## What is Harper

Harper is a Composable Application Platform that fuses database, cache, app logic, and messaging into one globally distributed runtime. Components like this bolt on instantly, letting you build resilient edge services without juggling separate systems.

## Features

| Capability | Detail |
| ----------- | ----- |
| Drop‑in KV Store | Single table (`RisqTable`) with four columns <1 KB/row |
| Millisecond Latency | Reads/writes typically <50 ms with default Harper settings |
| Simple REST API | Two endpoints (`/RisqTable`, `/risq`) using JSON over HTTPS |
| Header‑less Flow for B2C | B2C Identity Experience Framework (IEF) calls back to this service—no risk header required |
| Edge / Cloud / On‑prem | Runs anywhere Harper runs: container, binary, or edge function |
| Open Source (MIT) | Fork it, extend it, ship it |

## Architecture

```
Akamai APR ──writes──▶ Risk Score Component ──REST──▶ Azure AD B2C IEF
    ▲                                                     │
    │                                                     ▼
Login/App ──────────────────────── allow / challenge / block decision
```

1. APR calculates a risk score + decision and returns a correlationId.
1. APR executes `PUT /risq/{correlationId}` to store the score.
1. During login, B2C IEF policy executes an HTTP technical profile to read the score.
1. Policy logic performs allow, MFA challenge, or block.

## Local Quickstart

1. `git clone https://github.com/HarperDB/risk-query.git`
1. `cd risk-query`
1. `harperdb run .`

This assumes you have the Harper stack already installed. [Install Harper](https://docs.harperdb.io/docs/deployments/install-harperdb) globally.

## Usage

### Auth

Uses Basic auth passed in `Authorization` header

### Endpoints

| Endpoint                                                             | Description                                 |
| -------------------------------------------------------------------- | ------------------------------------------- |
| `/RisqTable`                                                         | Direct REST endpoint for the RisqTable table |
| `/risq`       | Allows PUT opperation using shorthand property keys                |

For a full description of what the REST API can do and how to use if your can refer to its [documentation](https://docs.harperdb.io/docs/developers/rest).

### Examples

##### *Upsert a new record.*

```
PUT /risq/bc01f3f7-5bda-4fdc-ad92-85a2cdf49d34

Headers:
Authorization: xxxxxxxxxxx

BODY: 
{
   "di": "d0c2a04e3c9d54b50e9f70b5d64d47e6a4c5c9c3e6f543a1a2f98cfa8c9d2e3f",
   "d": "allow",
   "r": 60
}

Response: 204 No Content
```

##### *Retrieve record by id.*

```
GET /risq/bc01f3f7-5bda-4fdc-ad92-85a2cdf49d34

Headers:
Authorization: xxxxxxxxxxx

Response: 200
{
    "deviceId": "d0c2a04e3c9d54b50e9f70b5d64d47e6a4c5c9c3e6f543a1a2f98cfa8c9d2e3f",
    "decision": "allow",
    "riskScore": 11,
    "correlationId": "bc01f3f7-5bda-4fdc-ad92-85a2cdf49d34"
}
```

## Data Model

### RisqTable Table

| Name                      | Description                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `correlationId` | ***(Primary Key; String)***  |
| `deviceId`         | ***(String)***  |
| `decision`                | ***(String)*** |
| `riskScore`                  | ***(Int)*** |


_Built with ❤️ at Harper_

const { RisqTable } = databases.risq;

class Risq extends RisqTable {
    put(payload) {
        super.put({
            deviceId: payload.di,
            decision: payload.d,
            riskScore: payload.r,
        });
    } 
}

export const risq = Risq;

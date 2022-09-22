const db = require('firebase/database');


async function get({ guildId, _case, userId } = {}) {
    const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs`);
    const value = (await db.get(ref))?.val();

    if (userId) {
        return Object.values(value ?? {})
            .filter(modlog => modlog.userId === userId);
    }

    if (_case) {
        const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs/${_case}`);
        const value = (await db.get(ref))?.val();

        return value;
    }

    return value;


}

async function getCase({ caseId, _case, } = {}) {
    const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs/${_case}`);
    const value = (await db.get(ref))?.val();


    if (caseId) {
        return Object.values(value)
            .filter(verifyId => verifyId.caseId === caseId);
    }

    if (_case) {
        const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs/${_case}`);
        const value = (await db.get(ref))?.val();

        return value;
    }

    return value;


}

async function create({ guildId, type, userId, user, staffId, staff, reason, duration } = {}) {
    const guildCases = await get({ guildId });

    const lastModLogsIndex = Object.keys(guildCases ?? {})
        .map((key) => { return { key, value: guildCases[key] } })
        .sort((a, b) => b.value.logTimestamp - a.value.logTimestamp)[0]?.key ?? 0

    const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs/${Number(lastModLogsIndex) + 1}`);

    const logTimestamp = Date.now();



    if (user) await db.update(ref, { user })
    if (type) await db.update(ref, { type })
    if (staffId) await db.update(ref, { staffId })
    if (staff) await db.update(ref, { staff })
    if (userId) await db.update(ref, { userId })
    if (duration) await db.update(ref, { duration });
    if (reason) await db.update(ref, { reason });
    
    await db.update(ref, { logTimestamp });
    await db.update(ref, { caseId: Number(lastModLogsIndex) + 1 });

}

async function remove({ guildId, _case } = {}) {

    const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs/${_case}`);
    await db.remove(ref);

}

async function update({ guildId, _case, reason } = {}) {

    const ref = db.ref(db.getDatabase(), `guilds/${guildId}/modlogs/${_case}`);
    await db.update(ref, { reason: reason });
    

}

module.exports = { get, create, remove, getCase, update }

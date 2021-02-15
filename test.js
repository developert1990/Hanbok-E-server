const a = (param) => { b(param) }

const b = (param) => { try { c(param) } catch (err) { res.status(500).text(err.message) } }

const c = (param) => {
    try { console.log(JSON.parse(param)); } catch (err) { console.log(err); throw err; }
}

a(new Error('test'))

const searchUser = async (username) => {
    const db = await mysql.createPool();
    const r = await db.query();
    return r;
}


const setupDb = () => mysql.createPool();
const searchUser2 = async (username, db) => {
    const r = db.query();
    return r;
}

const db = setupDb();
const user = searchUser2('test', db);


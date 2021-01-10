// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

const plain = '1234';
const hash = bcrypt.hashSync(plain, 8);

console.log(plain, hash)


const compare = async () => {
    const isAuthenticated = await bcrypt.compare(plain, '1234');
    console.log(isAuthenticated)
}

compare();
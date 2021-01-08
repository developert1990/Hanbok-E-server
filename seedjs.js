// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt');

const adminData = {
    name: 'Hong',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password', 8),
    isAdmin: true,
}

console.log('adminData: ', adminData)
require('dotenv').config();
const config = require('./src/config/config')['development'];
const Sequelize = require('sequelize');
const s = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialectOptions: { connectTimeout: 3000 }
});
s.authenticate()
    .then(() => { console.log('DB OK'); process.exit(0); })
    .catch(e => { console.log('DB FAIL:', e.message); process.exit(1); });

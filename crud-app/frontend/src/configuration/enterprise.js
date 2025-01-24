const mysql = require ('mysql2/promise') 

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'crud_db',
});
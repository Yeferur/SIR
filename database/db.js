const mysql = require('mysql');
const connection = mysql.createConnection({
    // socketPath : process.env.DB_SOCKET,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});


connection.connect((error)=>{
    if(error){
        console.log('El error: ' + error);
        return;
    }else{
        console.log('Conectado a la base de datos')
    }
});

module.exports = connection;
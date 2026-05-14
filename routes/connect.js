// connect.js
const oracledb = require('oracledb');
async function getConnection()
{
    let connection;
    try{
        connection = await oracledb.getConnection({
            user:'user01',
            password:'pass',
            connectString:'localhost:1521/xe'
        });
        //console.log('DB 연결 성공');
        return connection;
    }
    catch(err)
    {
        console.log("DB 연결 오류", err.message)
    }
}
module.exports = {getConnection};
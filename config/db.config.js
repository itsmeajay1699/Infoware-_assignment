var mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();
const { host, PORT, user, password, database, NODE_ENV } = process.env;
console.log("host:", host);
var con = mysql.createPool({
  host,
  user,
  password,
  database,
});

//connectDB establishes a connection to a MySQL database using the connection configuration specified in the con object.
//It logs a message to the console if the connection is successful or if an error occurs.
const connectDB = () => {
  return new Promise((resolve, reject) => {
    con.getConnection((err, connection) => {
      if (err) {
        console.log("Error connecting to the database:", err);
        return reject(err);
      }
      try { 
        console.log("Connected to the database");
        console.log("NODE_ENV:", NODE_ENV);
        resolve(connection);
      } finally {
        connection.release();
      }
    });
  });
};

//dbQuery is an async function that takes an SQL string sql and an optional content parameter.
//It returns a promise that resolves with the result of the query or rejects with an error if one occurs.
const dbQuery = (sql, content) => {
  return new Promise((resolve, reject) => {
    con.getConnection((err, connection) => {
      if (err) {
        console.log("Error connecting to the database:", err);
        return reject(err);
      }
      try {
        connection.beginTransaction();
        con.query(sql, content, (err, result) => {
          if (err) {
            console.log("Error on the database query:", sql, content, err);
            connection.rollback();
            return reject(err);
          }
          connection.commit();
          resolve(result);
        });
      } catch (err) {
        connection.rollback();
        reject(err);
      } finally {
        connection.release();
      }
    });
  });
};

//The reconnectToDB function is called when the database connection is lost.
const reconnectToDB = async () => {
  await con.connect((err) => {
    if (err) {
      console.log("Error connecting to the database:", err);
      process.exit(0);
    }
    console.log("Successfully reconnected to the database");
  });
};

//The reconnectToDB function is called when the database connection is lost.
con.on("error", (err) => {
  console.error("Error on the database connection:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log(
      "Connection to the database was lost. Attempting to reconnect..."
    );
    reconnectToDB();
  }
});

//The exitHandler function is set up to handle the exit event of the process object,
// which is emitted when the Node.js process is about to exit. If the shutdownDb option is truthy,
//the function logs a message and closes the database connection by calling con.end().
//Finally, the process exits with an exit code of 1.
const exitHandler = (options, exitCode) => {
  if (options.shutdownDb) {
    console.log("\nShutting down... DATABASE");
    con.end();
    process.exit(0);
  }
};
process.on("SIGINT", exitHandler.bind(null, { shutdownDb: true }));

//This code exports two functions: connectDB and dbQuery.
module.exports = { connectDB, dbQuery };

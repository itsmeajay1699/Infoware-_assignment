const express = require("express");
const { connectDB } = require("./config/db.config");
const dotenv = require("dotenv");
const { router } = require("./routes/employees.routes");
const app = express();
dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/v1/employees", router);  

app.listen(process.env.Port, () =>
  console.log(`Server started on port ${process.env.Port}`) 
);

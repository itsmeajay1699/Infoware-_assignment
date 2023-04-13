const express = require("express");

const {
  getEmployees,
  deleteEmployee,
  createEmployee,
  updateEmployee,
} = require("../controller/employees");

const router = express.Router();

router
  .get("/", getEmployees)
  .post("/", createEmployee)
  .delete("/:id", deleteEmployee)
  .put("/:id", updateEmployee);

module.exports = { router };

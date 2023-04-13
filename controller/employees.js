const { dbQuery } = require("../config/db.config");

// @desc   Get all employees from database with pagination
// @route  GET /api/employees
// @access PUBLIC
const getEmployees = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    if (page < 1) {
      return res
        .status(400)
        .json({ error: "Page number should be greater than 0" });
    }
    const offset = (page - 1) * limit;
    const employees = await dbQuery(
      `SELECT * FROM employees LIMIT ${limit} OFFSET ${offset}`
    );
    const total = await dbQuery("SELECT COUNT(*) as count FROM employees");
    if (!employees.length)
      return res.status(400).json({ error: "No employees found" });
    return res.status(200).json({ employees, totalEmployees: total[0].count });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @desc   Delete employee from database using id params
// @route  DELETE /api/employees/:id
// @access PUBLIC
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id is required" });
    const employees = await dbQuery("DELETE FROM employees WHERE EmpID = ?", [
      id,
    ]);
    if (!employees.affectedRows)
      return res.status(400).json({ error: "Employee not found" });
    return res
      .status(200)
      .json({ status: "Success", message: "Employee deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @desc   Create employee in database
// @route  POST /api/employees
// @access PUBLIC
const createEmployee = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const query = `INSERT INTO employees (EmpName,EmpEmail,EmpPhone) VALUES ('${name}','${email}','${phone}')`;
    await dbQuery(query, (err, result) => {
      if (err) {
        throw err;
      }
      const employeeId = result.insertId;
      const contactDetails = req.body.contactDetails;
      const contactDetailsQuery = `INSERT INTO contact_details (employee_id,Address,City,State,Emergency_No,Relationship,Secondary_Emergency_No) VALUES ?`;
      const contactDetailsValues = contactDetails.map((contactDetail) => [
        employeeId,
        contactDetail.address,
        contactDetail.city,
        contactDetail.state,
        contactDetail.Emer_No,
        contactDetail.relationship,
        contactDetail.secondNo,
      ]);
      dbQuery(contactDetailsQuery, [contactDetailsValues], (err, result) => {
        if (err) {
          throw err;
        }
      }).then((result) => {
        return res.send("Employee created successfully");
      });
    });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @desc   Update employee in database using id params
// @route  PUT /api/employees/:id
// @access PUBLIC
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    if (!id) return res.status(400).json({ error: "id is required" });
    const employees = await dbQuery(
      "UPDATE employees SET EmpName = ?, EmpEmail = ?, EmpPhone = ? WHERE EmpID = ?",
      [name, email, phone, id]
    );
    if (!employees.affectedRows)
      return res.status(400).json({ error: "Employee not found" });
    return res
      .status(200)
      .json({ status: "Success", message: "Employee updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

module.exports = {
  getEmployees,
  deleteEmployee,
  createEmployee,
  updateEmployee,
};

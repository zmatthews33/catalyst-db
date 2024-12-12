// app.js
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: ['http://localhost:5173','http://127.0.0.1:5173', '*'], // Allow only this frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.options('*', cors());

app.post('/store-exercise-data', (req, res) => {
  const {
    name,
    email,
    workouts_per_week,
    ankle_mobility_right_ins,
    ankle_mobility_left_ins,
    knee_strength_together_secs,
    knee_strength_right_secs,
    knee_strength_left_secs,
    glute_med_strength_V1_right_secs,
    glute_med_strength_V1_left_secs,
    glute_med_strength_V2_right_secs,
    glute_med_strength_V2_left_secs,
    hamstring_strength_right_reps,
    hamstring_strength_left_reps,
    glute_max_strength_right_reps,
    glute_max_strength_left_reps,
    balance_eyes_open_right_secs,
    balance_eyes_open_left_secs,
    balance_eyes_closed_right_secs,
    balance_eyes_closed_left_secs,
    calf_strength_together_reps,
    calf_strength_right_reps,
    calf_strength_left_reps,
  } = req.body;

  // Check if email exists and get the highest `test_no` for it
  const findTestNoQuery = `SELECT MAX(test_no) as maxTestNo FROM exercise_testing_data WHERE email = ?`;

  connection.query(findTestNoQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking test_no:', err);
      return res.status(500).json({ message: 'Error checking test_no' });
    }

    // Determine the next `test_no`
    const nextTestNo = results[0].maxTestNo ? results[0].maxTestNo + 1 : 1;

    // Insert the new data with the incremented `test_no`
    const insertQuery = `
      INSERT INTO exercise_testing_data (
        name, email, workouts_per_week, ankle_mobility_right_ins, ankle_mobility_left_ins,
        knee_strength_together_secs, knee_strength_right_secs, knee_strength_left_secs,
        glute_med_strength_V1_right_secs, glute_med_strength_V1_left_secs,
        glute_med_strength_V2_right_secs, glute_med_strength_V2_left_secs,
        hamstring_strength_right_reps, hamstring_strength_left_reps,
        glute_max_strength_right_reps, glute_max_strength_left_reps,
        balance_eyes_open_right_secs, balance_eyes_open_left_secs,
        balance_eyes_closed_right_secs, balance_eyes_closed_left_secs,
        calf_strength_together_reps, calf_strength_right_reps, calf_strength_left_reps,
        test_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      name,
      email,
      workouts_per_week,
      ankle_mobility_right_ins,
      ankle_mobility_left_ins,
      knee_strength_together_secs,
      knee_strength_right_secs,
      knee_strength_left_secs,
      glute_med_strength_V1_right_secs,
      glute_med_strength_V1_left_secs,
      glute_med_strength_V2_right_secs,
      glute_med_strength_V2_left_secs,
      hamstring_strength_right_reps,
      hamstring_strength_left_reps,
      glute_max_strength_right_reps,
      glute_max_strength_left_reps,
      balance_eyes_open_right_secs,
      balance_eyes_open_left_secs,
      balance_eyes_closed_right_secs,
      balance_eyes_closed_left_secs,
      calf_strength_together_reps,
      calf_strength_right_reps,
      calf_strength_left_reps,
      nextTestNo
    ];

    connection.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Failed to store test data' });
      }
      res.status(201).json({ message: 'Test data stored successfully', test_no: nextTestNo });
    });
  });
});
app.post('/store-exercise-plan', (req, res) => {
  const {
    name,
    email,
    workouts_per_week,
    month1_exercises,
    month2_exercises,
    month3_exercises,
    test_no
  } = req.body;

  // Validate input
  if (!name || !email || !workouts_per_week || !month1_exercises || !month2_exercises || !month3_exercises) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  const findTestNoQuery = `SELECT MAX(test_no) as maxTestNo FROM exercise_testing_data WHERE email = ?`;

  connection.query(findTestNoQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking test_no:', err);
      return res.status(500).json({ message: 'Database error while checking test_no' });
    }

    // Handle case where no results are found for the email
    const nextTestNo = (results && results.length > 0 && results[0].maxTestNo) ? results[0].maxTestNo + 1 : 1;

    const insertQuery = `
      INSERT INTO exercise_plan_data (
        name, email, workouts_per_week, month1_exercises, month2_exercises, month3_exercises, test_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      email,
      workouts_per_week,
      JSON.stringify(month1_exercises), // Store as JSON strings
      JSON.stringify(month2_exercises),
      JSON.stringify(month3_exercises),
      nextTestNo
    ];

    connection.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Failed to store test data' });
      }
      res.status(201).json({ message: 'Test data stored successfully', test_no: nextTestNo });
    });
  });
});

app.get("/store-exercise-plan", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send("Email is required");

  try {
    connection.execute("SELECT * FROM exercise_plan_data WHERE LOWER(email) = LOWER(?)", [email], (err, result) => {
      if (err) {
        console.error("Error during query:", err);
        return res.status(500).send("Server error");
      }
      console.log('Query Result:', result);
      if (result.length === 0) return res.status(404).send("Client not found");
      res.json(result);
    });
  } catch (err) {
    console.error("Error during processing:", err);
    res.status(500).send("Server error");
  }
});

// Start the server
const PORT = process.env.SERVER_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// app.js
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db'); // Import the database connection

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON request bodies

app.use(cors({
  origin: 'http://127.0.0.1:5173', // Allow only this frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
// Route to store exercise data
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
// Start the server
const PORT = process.env.SERVER_PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

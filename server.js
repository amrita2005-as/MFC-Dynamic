const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const path = require("path");

// Flask fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Init Express
const app = express();

// PostgreSQL Setup
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "MFC",
  password: "admin123",  // change for production
  port: 5432,
});

db.connect(err => {
  if (err) console.error("DB connection failed:", err.stack);
  else console.log("🔌 Connected to PostgreSQL");
});

db.on("error", err => {
  console.error("Postgres error:", err);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- ROUTES -------------------- //

// Home
app.get("/", (req, res) => res.render("home", { title: "PowerSprout Home" }));

// Monitoring Page
app.get("/index", (req, res) => res.render("index", { title: "MFC Monitoring" }));

// Sensor Dashboard
app.get("/dashboard", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM mfc_monitoring");

    const timeMap = new Map();
    result.rows.forEach(row => {
      const timeLabel = new Date(row.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (!timeMap.has(timeLabel)) {
        timeMap.set(timeLabel, {
          Sensor1: null,
          Sensor2: null,
          Sensor3: null,
        });
      }
      timeMap.get(timeLabel)[row.sensor_name] = row.sensor_value;
    });

    const sortedEntries = [...timeMap.entries()].sort((a, b) =>
      new Date(`1970/01/01 ${a[0]}`) - new Date(`1970/01/01 ${b[0]}`)
    );

    const sensorData = {
      labels: [],
      datasets: {
        Sensor1: [],
        Sensor2: [],
        Sensor3: [],
      },
    };

    sortedEntries.forEach(([label, sensors]) => {
      sensorData.labels.push(label);
      sensorData.datasets.Sensor1.push(sensors.Sensor1 ?? null);
      sensorData.datasets.Sensor2.push(sensors.Sensor2 ?? null);
      sensorData.datasets.Sensor3.push(sensors.Sensor3 ?? null);
    });

    res.render("dashboard", {
      title: "Sensor Dashboard",
      sensorData,
      data: result.rows,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send("Dashboard fetch failed.");
  }
});

// Static Pages
app.get("/vision", (req, res) => res.render("vision", { title: "Our Vision" }));
app.get("/mission", (req, res) => res.render("mission", { title: "Our Mission" }));
app.get("/iot", (req, res) => res.render("iot", { title: "IoT & MFC" }));

// -------------------- ENERGY PREDICTION -------------------- //

app.get("/prediction", (req, res) => {
  res.render("prediction-form", { title: "Energy Prediction" });
});

app.post("/prediction", async (req, res) => {
  const { pH, temperature, gas_level, weight_kg } = req.body;

  try {
    const payload = {
      pH: parseFloat(pH),
      temperature: parseFloat(temperature),
      gas_level: parseFloat(gas_level),
      weight_kg: parseFloat(weight_kg),
    };

    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const prediction = data.predicted_energy_mJ ?? data.prediction;

    res.render("prediction", {
      prediction,
      input: payload,
      title: "Energy Prediction Result"
    });
  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).send("Prediction failed.");
  }
});

// -------------------- WEIGHT PREDICTION -------------------- //

app.get("/form", (req, res) => {
  res.render("form", { title: "Weight Estimator" });
});

app.post("/predict-weight", async (req, res) => {
  const { device, duration_minutes } = req.body;

  try {
    const payload = {
      device,
      duration_minutes: parseFloat(duration_minutes),
    };

    const response = await fetch("http://127.0.0.1:5000/predict-weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    res.render("prediction", {
      prediction: data,
      input: payload,
      title: "Required Weight Prediction"
    });
  } catch (err) {
    console.error("Weight Prediction Error:", err);
    res.status(500).send("Weight prediction failed.");
  }
});

// Export app for use in index.js
module.exports = app;

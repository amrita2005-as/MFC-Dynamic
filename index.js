import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL setup
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "MFC",
  password: "admin123",
  port: 5432,
});
db.connect();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/index", (req, res) => {
  res.render("index", { title: "MFC Monitoring" });
});

app.get("/dashboard", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM mfc_monitoring");

    const timeMap = new Map();
    result.rows.forEach(row => {
      const timeLabel = new Date(row.timestamp).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      if (!timeMap.has(timeLabel)) {
        timeMap.set(timeLabel, { Sensor1: null, Sensor2: null, Sensor3: null });
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
        Sensor3: []
      }
    };

    sortedEntries.forEach(([timeLabel, sensors]) => {
      sensorData.labels.push(timeLabel);
      sensorData.datasets.Sensor1.push(sensors.Sensor1 ?? null);
      sensorData.datasets.Sensor2.push(sensors.Sensor2 ?? null);
      sensorData.datasets.Sensor3.push(sensors.Sensor3 ?? null);
    });

    res.render("dashboard", {
      title: "Sensor Dashboard",
      sensorData,
      data: result.rows
    });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Error retrieving sensor data.");
  }
});

// ✅ New Routes for Vision and Mission
app.get("/vision", (req, res) => {
  res.render("vision");
});

app.get("/mission", (req, res) => {
  res.render("mission");
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

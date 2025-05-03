import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "MFC-Monitoring",
  password: "------",
  port: "5432",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs", { title: "MFC Monitoring" });
});

app.get("/dashboard", async(req,res)=>{
  try{
    const data = await db.query("SELECT DISTINCT ON(sensor_name) sensor_name,values,timestamp from mfc ORDER BY sensor_name,timestamp DESC");
    const data1 = data.rows;
    /*const sensor_data = {};
    data1.rows.forEach(i=>{
      sensor_data[i.sensor_name]={
        value:i.sensor_value,
        timestamp:i.timestamp
      }
    })*/
    res.render("dashboard.ejs", { data:data1 });
  }
  catch{
    res.status(500).send("Error retrieving data from database.");
  }
});

app.listen(port,() => {
  console.log(`Server is running on http://localhost:${port}`);
});
# app.py
from flask import Flask, request, jsonify
import pandas as pd
from collections import defaultdict
import math
from predict_weight import estimate_required_weight

app = Flask(__name__)

# Load your MFC dataset once at start (make sure path is correct)
df = pd.read_csv("mfc_data2.csv")

# Dummy recent sensor data — replace this with real sensor fetching logic
sensorData = [
    {"sensor_name": "pH Sensor", "sensor_value": 6.9},
    {"sensor_name": "Weight Sensor", "sensor_value": 0.88},
    {"sensor_name": "Current Sensor", "sensor_value": 0.11},
    {"sensor_name": "Temperature Sensor", "sensor_value": 28},
    {"sensor_name": "pH Sensor", "sensor_value": 7},
    {"sensor_name": "Weight Sensor", "sensor_value": 0.91},
    {"sensor_name": "Current Sensor", "sensor_value": 0.12},
    {"sensor_name": "Temperature Sensor", "sensor_value": 27.5},
    {"sensor_name": "pH Sensor", "sensor_value": 6.8},
    {"sensor_name": "Weight Sensor", "sensor_value": 0.89},
]

# Helper: average sensor data values by sensor_name
def average_sensor_data(sensor_data):
    sums = defaultdict(float)
    counts = defaultdict(int)

    for entry in sensor_data:
        name = entry['sensor_name']
        value = float(entry['sensor_value'])
        sums[name] += value
        counts[name] += 1

    averages = {}
    for sensor_name, total in sums.items():
        averages[sensor_name] = round(total / counts[sensor_name], 3)

    return averages


@app.route("/predict-weight", methods=["POST"])
def predict_weight():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        device = data.get("device", "bulb").lower()
        duration_minutes = float(data.get("duration_minutes", 0))

        if duration_minutes <= 0:
            return jsonify({"error": "Invalid duration"}), 400

        # Device power ratings in Watts
        devices = {
            "bulb": 9,
            "fan": 50,
            "laptop": 60,
            "fridge": 150,
            "tv": 100
        }

        if device not in devices:
            return jsonify({"error": "Unknown device"}), 400

        power_watt = devices[device]
        hours = duration_minutes / 60

        # Average sensor values from dummy data (replace with real sensors!)
        averages = average_sensor_data(sensorData)
        pH = averages.get("pH Sensor", 6.5)
        temp = averages.get("Temperature Sensor", 32)
        # Assume gas sensor is "Current Sensor" scaled (tweak as needed)
        gas = averages.get("Current Sensor", 0) * 1000  # example scaling

        # Estimate required weight of food waste
        required_weight = estimate_required_weight(pH, temp, gas, power_watt, hours)

        return jsonify({"required_weight_kg": required_weight})

    except Exception as e:
        print(f"Error in /predict-weight: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

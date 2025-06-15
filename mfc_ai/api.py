from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load("energy_model1.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        # Read sensor values from POSTed JSON
        pH = float(data.get("pH", 6.5))
        temperature = float(data.get("temperature", 30))
        gas_level = float(data.get("gas_level", 500))
        weight_ml = float(data.get("weight_kg", 250))

        # Predict
        input_data = [[pH, temperature, gas_level, weight_ml]]
        prediction = model.predict(input_data)[0]
        return jsonify({"predicted_energy_mJ": round(prediction, 4)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
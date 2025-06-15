import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load dataset
data = pd.read_csv("mfc_data1.csv")

# Input features and target
X = data[["pH", "temperature", "gas_level", "weight_kg"]]
y = data["energy_mJ"]

# Split into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict on test set
y_pred = model.predict(X_test)

# Evaluation
print("Model Trained!")
print("Mean Squared Error:", mean_squared_error(y_test, y_pred))
print("R² Score:", r2_score(y_test, y_pred))

# Optional: Print sample predictions
print("\n🔧 Sample Predictions:")
for i in range(5):
    print(f"Input: {X_test.iloc[i].to_dict()} → Predicted Energy: {round(y_pred[i], 4)} mJ")

joblib.dump(model,'energy_model1.pkl')
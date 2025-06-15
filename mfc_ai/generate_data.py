import random
import csv
import math  

# Function to simulate voltage based on sensor values
def estimate_voltage(pH, temp, gas, weight_kg):
    pH_score = max(0, 1 - abs(pH - 6.5) / 4)
    temp_score = max(0, 1 - abs(temp - 32) / 10)
    gas_score = min(gas / 800, 1)
    weight_score = min(math.log10(weight_kg + 1) / math.log10(1000000000), 1)

    base_voltage = 0.1
    voltage = base_voltage + 1.5 * (
        0.3 * pH_score +
        0.3 * temp_score +
        0.2 * gas_score +
        0.2 * weight_score
    )
    return round(min(voltage, 2.5), 3)

# Function to estimate energy using capacitor formula (500 µF)
def estimate_energy(voltage, capacitance=0.1):
    energy_joules = 0.5 * capacitance * voltage ** 2
    return round(energy_joules, 6)  

# Write simulated data to CSV
def generate_csv(filename, rows=100):
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["pH", "temperature", "gas_level", "weight_kg", "voltage", "energy"])

        for _ in range(rows):
            pH = round(random.uniform(2.5, 9.5), 2)
            temp = round(random.uniform(20.0, 45.0), 1)
            gas = random.randint(300, 800)
            weight_kg = round(random.uniform(0.05, 1e9), 3)  

            voltage = estimate_voltage(pH, temp, gas, weight_kg)
            energy = estimate_energy(voltage)

            writer.writerow([pH, temp, gas, weight_kg, voltage, energy])

    print(f" {rows} rows of data saved to {filename}")

generate_csv("mfc_data2.csv", rows=300) 
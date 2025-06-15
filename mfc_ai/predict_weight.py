# predict_weight.py

import math

# Estimate the output voltage based on environmental parameters and food waste weight
def estimate_voltage(pH, temp, gas, weight_kg):
    # Normalize environmental scores
    pH_score = max(0, 1 - abs(pH - 6.5) / 4)
    temp_score = max(0, 1 - abs(temp - 32) / 10)
    gas_score = min(gas / 800, 1)
    weight_score = min(math.log10(weight_kg + 1) / math.log10(1e9), 1)

    # Calculate voltage using weighted scores
    base_voltage = 0.1
    voltage = base_voltage + 1.5 * (
        0.3 * pH_score +
        0.3 * temp_score +
        0.2 * gas_score +
        0.2 * weight_score
    )

    return round(min(voltage, 2.5), 3)

# Estimate energy output using capacitor energy formula
def estimate_energy(voltage, capacitance=0.1):
    energy_joules = 0.5 * capacitance * voltage ** 2
    return round(energy_joules, 6)

# Estimate required food waste weight to meet device energy demand
def estimate_required_weight(pH, temp, gas, device_watts, hours, tolerance=0.01):
    energy_needed_j = device_watts * hours * 3600  # Convert watt-hours to joules
    low, high = 0.001, 1e9  # Weight search bounds

    # Binary search to find required weight
    while low < high:
        mid = (low + high) / 2
        voltage = estimate_voltage(pH, temp, gas, mid)
        energy = estimate_energy(voltage)

        if abs(energy - energy_needed_j) <= tolerance:
            return round(mid, 3)
        elif energy < energy_needed_j:
            low = mid + 0.001
        else:
            high = mid - 0.001

        if high - low < 0.001:
            break

    return round((low + high) / 2, 3)

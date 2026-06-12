import os

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend/data"))

# 1. Manuals
manuals = {
    "Motor-4_Service_Manual.md": """# Rolling Mill Motor 4 - Service Manual

## 1. Specifications
- Model: HZ-500kW Heavy Duty
- Rated RPM: 1500
- Bearings: SKF 6205-2RS (Drive End / Non-Drive End)
- Lubrication: High-temp lithium complex grease

## 2. Troubleshooting
### 2.1 High Vibration
- **Check alignment:** Alignment tolerance should not exceed 0.05mm.
- **Check bearings:** If vibration is accompanied by high temperature, inspect bearings for wear or lubrication failure.
- **Foundation:** Inspect mounting bolts.

### 2.2 Overheating
- Ensure cooling system CS-01 is providing adequate flow.
- Check for bearing lubrication issues.
""",
    "Gearbox-GB02_Manual.md": """# Gearbox GB-02 Service Manual
## 1. Specs
- Type: Helical Reduction
- Oil Capacity: 50L
## 2. Maintenance
- Oil change interval: Every 6 months.
- Vibration check: Monthly.
""",
    "Press-HP02_Manual.md": """# Hydraulic Press HP-02 Manual
## Troubleshooting
- **Pressure Drop:** Check hydraulic seals, especially main ram seal. Look for fluid contamination.
- **Overheating:** Ensure cooling circuit is active.
""",
    "Conveyor-C01_Manual.md": """# Conveyor C-01 Manual
## Maintenance
- Inspect belt tension weekly.
- Check rollers for seizure.
""",
    "Cooling-CS01_Manual.md": """# Cooling System CS-01 Manual
## Troubleshooting
- **Flow Rate Drop:** Check pump cavitation or valve blockage.
- **Temperature Rise:** Heat exchanger fouling.
"""
}

# 2. SOPs
sops = {
    "SOP-LUB-001.md": """# SOP-LUB-001: Motor Lubrication Procedure

## 1. Purpose
Standard procedure for lubricating heavy-duty electric motors.

## 2. Scope
Applies to all rolling mill motors, including Motor-4.

## 3. Procedure
### 3.1 Preparation
- Ensure motor is safely locked out if static lubrication is required.
- Clean grease nipple.

### 3.2 Interval
- **Bearing lubrication interval: 30 days.**

### 3.3 Execution
- Inject 15g of specified high-temp lithium complex grease.
- Do not over-lubricate to avoid seal blowout.
""",
    "SOP-ALIGN-002.md": """# SOP-ALIGN-002: Shaft Alignment

## 1. Procedure
- Use laser alignment tool.
- Tolerance is 0.05mm for high-speed shafts.
""",
    "SOP-HYD-003.md": """# SOP-HYD-003: Hydraulic Seal Replacement
- Depressurize system completely.
- Use OEM seal kits only.
""",
    "SOP-COOL-004.md": """# SOP-COOL-004: Heat Exchanger Cleaning
- Backflush every 3 months.
""",
    "SOP-INSP-005.md": """# SOP-INSP-005: Daily Visual Inspection
- Check for abnormal noise.
- Check for visible leaks.
""",
    "SOP-VIB-006.md": """# SOP-VIB-006: Vibration Analysis
- Record spectra monthly.
""",
    "SOP-ELEC-007.md": """# SOP-ELEC-007: Motor Current Check
- Compare all three phases. Max imbalance 2%.
""",
    "SOP-SAF-008.md": """# SOP-SAF-008: Lockout Tagout (LOTO)
- Always verify zero energy state.
"""
}

for filename, content in manuals.items():
    with open(os.path.join(DATA_DIR, "manuals", filename), 'w') as f:
        f.write(content)

for filename, content in sops.items():
    with open(os.path.join(DATA_DIR, "sops", filename), 'w') as f:
        f.write(content)

print("Generated Manuals and SOPs.")

# activity_8b · Sensor Check

Test sensors one at a time. Light module: SIG → A0, VCC → 5V, GND → GND; NC unconnected. Force sensor: 5V → FSR → A0 junction, with 10 kΩ from the junction to GND. Analog distance module: analog output → A0, power per its datasheet. The slides describe an analog-output ultrasonic sensor; HC-SR04 requires different wiring/code. The 520 cm full-scale conversion must match the actual module. Needed: 2–3 real photos and a demo video.

Open each sketch in its identically named folder in Arduino IDE. Code prepared with AI assistance; not compiled with an Arduino board core or tested on hardware in this session. Do not mark the physical activity complete until wired and observed.

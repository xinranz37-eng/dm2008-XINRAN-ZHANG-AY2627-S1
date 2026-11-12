# activity_8b - Sensor Check

## Code

- [light.ino](light/light.ino): Phototransistor readings.
- [force.ino](force/force.ino): Force sensor readings.
- [analog_distance.ino](analog_distance/analog_distance.ino): Analog ultrasonic distance readings.

Open one sketch at a time in Arduino IDE. Each .ino file is inside a folder with the same name. Select Arduino Uno and the correct port before uploading.

## Setup

Test one sensor at a time on A0. For the light module, connect SIG to A0, VCC to 5V and GND to GND. For the force sensor, connect one side to 5V and the other to A0, with a 10k ohm resistor between A0 and GND. The distance sketch follows the analog-output sensor and 520 cm conversion in the slides. It is not code for a trigger/echo HC-SR04. Use Serial Monitor at 9600 baud.

## Documentation

[Arduino photos and videos](../arduino/documentation/)

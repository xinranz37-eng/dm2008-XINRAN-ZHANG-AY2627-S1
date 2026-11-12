# activity_9a - Mapping Sensors

## Code

- [mapping_sensors.ino](mapping_sensors/mapping_sensors.ino): Distance controls LED brightness.

Open one sketch at a time in Arduino IDE. Each .ino file is inside a folder with the same name. Select Arduino Uno and the correct port before uploading.

## Setup

Connect the course analog distance sensor output to A0. Connect PWM pin 9 through a 220 or 330 ohm resistor to the LED anode, and the cathode to GND. A distance from 5 to 100 cm maps to brightness from 255 to 0. The code smooths changes between readings. Use Serial Monitor at 9600 baud.

## Documentation

[Arduino photos and videos](../arduino/documentation/)

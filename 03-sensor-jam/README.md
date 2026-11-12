# Sensor Jam - Opening Flower

## Files

- [Arduino code](sensor_sender/sensor_sender.ino)
- [p5.js sketch](sketch.js)
- [Web page](index.html)
- [Arduino photos and videos](../arduino/documentation/)

## Setup

Use the course analog-output distance sensor on A0. Upload sensor_sender.ino to the Arduino Uno. It sends one distance value per line at 9600 baud, matching the flower sketch. This conversion follows the course sensor; it is not for a trigger/echo HC-SR04.

Close Arduino Serial Monitor, run the webpage on localhost in Chrome, and click Connect to Arduino. Move closer to open the flower and farther away to close it. The five pastel circles move smoothly between positions.

## Running locally

From the repository root, run `python3 -m http.server 8000` and open http://localhost:8000/03-sensor-jam/.

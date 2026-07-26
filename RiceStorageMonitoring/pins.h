#ifndef PINS_H
#define PINS_H

//========================
// TFT LCD
//========================
#define TFT_MOSI 23
#define TFT_MISO 19
#define TFT_SCLK 18
#define TFT_CS   5
#define TFT_DC   16
#define TFT_RST  17

//========================
// Touch Screen
//========================
#define TOUCH_CS   4

//========================
// DHT22
//========================
#define DHT1_PIN 21
#define DHT2_PIN 22
#define DHT3_PIN 13
#define DHT4_PIN 14

//========================
// Moisture Sensors
//========================
#define MS1_PIN 32
#define MS2_PIN 33
#define MS3_PIN 25
#define MS4_PIN 26
#define MS5_PIN 34
#define MS6_PIN 35
//========================
// Relay
//========================
#define RELAY_PIN 15

//========================
// Buzzer
//========================
#define BUZZER_PIN 2

//========================
// LEDs
//========================
#define GREEN_LED 27
#define YELLOW_LED 12
#define RED_LED 0

void initPins();

#endif
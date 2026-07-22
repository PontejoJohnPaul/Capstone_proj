#ifndef DHT_SENSOR_H
#define DHT_SENSOR_H

#include <Arduino.h>
#include <DHT.h>

#define DHT_TYPE DHT22

struct DHTData
{
    DHT* sensor;

    uint8_t pin;

    bool enabled;

    bool connected;

    float temperature;

    float humidity;
};

extern DHTData dhtSensors[4];

void initDHT();
void readDHT();

float getAverageTemperature();
float getAverageHumidity();

#endif


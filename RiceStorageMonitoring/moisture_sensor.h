#ifndef MOISTURE_SENSOR_H
#define MOISTURE_SENSOR_H

#include <Arduino.h>

struct MoistureData
{
    uint8_t pin;

    bool enabled;

    bool connected;

    int rawValue;

    int moisturePercent;

    bool batchRunning;

    int batchSize;

    int infested;

    int safe;
};

extern MoistureData moistureSensors[6];

void initMoisture();

void readMoisture();

int getAverageMoisture();

#endif
#include <Arduino.h>
#include "dht_sensor.h"
#include "pins.h"

DHT dht1(DHT1_PIN, DHT_TYPE);
DHT dht2(DHT2_PIN, DHT_TYPE);
DHT dht3(DHT3_PIN, DHT_TYPE);
DHT dht4(DHT4_PIN, DHT_TYPE);

DHTData dhtSensors[4] =
{
    {&dht1, DHT1_PIN, false, false, NAN, NAN},
    {&dht2, DHT2_PIN, false, false, NAN, NAN},
    {&dht3, DHT3_PIN, false, false, NAN, NAN},
    {&dht4, DHT4_PIN, false, false, NAN, NAN}
};


void initDHT()
{
    for(int i = 0; i < 4; i++)
    {
        dhtSensors[i].sensor->begin();
    }
}

void readDHT()
{
    for(int i = 0; i < 4; i++)
    {
        if(!dhtSensors[i].enabled)
            continue;

        float temp = dhtSensors[i].sensor->readTemperature();
        float hum  = dhtSensors[i].sensor->readHumidity();

        if(isnan(temp) || isnan(hum))
        {
            dhtSensors[i].connected = false;
            dhtSensors[i].temperature = NAN;
            dhtSensors[i].humidity = NAN;
            continue;
        }

        dhtSensors[i].connected = true;
        dhtSensors[i].temperature = temp;
        dhtSensors[i].humidity = hum;
    }
}

float getAverageTemperature()
{
    float sum = 0;
    int count = 0;

    for(int i = 0; i < 4; i++)
    {
        if(!isnan(dhtSensors[i].temperature))
        {
            sum += dhtSensors[i].temperature;
            count++;
        }
    }

    if(count == 0)
        return NAN;

    return sum / count;
}

float getAverageHumidity()
{
    float sum = 0;
    int count = 0;

    for(int i = 0; i < 4; i++)
    {
        if(!isnan(dhtSensors[i].humidity))
        {
            sum += dhtSensors[i].humidity;
            count++;
        }
    }

    if(count == 0)
        return NAN;

    return sum / count;
}
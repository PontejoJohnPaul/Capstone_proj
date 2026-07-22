#include "moisture_sensor.h"
#include "pins.h"
#include "config.h"

MoistureData moistureSensors[6] =
{
{MS1_PIN, false, false, 0, 0, false, 0, 0, 0},
{MS2_PIN, false, false, 0, 0, false, 0, 0, 0},
{MS3_PIN, false, false, 0, 0, false, 0, 0, 0},
{MS4_PIN, false, false, 0, 0, false, 0, 0, 0},
{MS5_PIN, false, false, 0, 0, false, 0, 0, 0},
{MS6_PIN, false, false, 0, 0, false, 0, 0, 0}
};

void initMoisture()
{
    for(int i = 0; i < 6; i++)
    {
        pinMode(moistureSensors[i].pin, INPUT);
    }
}

void readMoisture()
{
    for(int i=0;i<6;i++)
    {
        if(!moistureSensors[i].enabled)
        {
            moistureSensors[i].connected = false;
            moistureSensors[i].rawValue = 0;
            moistureSensors[i].moisturePercent = 0;
            continue;
        }

        moistureSensors[i].rawValue =
            analogRead(moistureSensors[i].pin);

        moistureSensors[i].connected = true;

        moistureSensors[i].moisturePercent =
            map(
                moistureSensors[i].rawValue,
                MOISTURE_DRY,
                MOISTURE_WET,
                0,
                100
            );

        moistureSensors[i].moisturePercent =
            constrain(
                moistureSensors[i].moisturePercent,
                0,
                100
            );
    }
}

int getAverageMoisture()
{
    int sum = 0;
    int count = 0;

    for(int i = 0; i < 6; i++)
    {
        if(moistureSensors[i].connected)
        {
            sum += moistureSensors[i].moisturePercent;
            count++;
        }
    }

    if(count == 0)
        return 0;

    return sum / count;
}
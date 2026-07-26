#include <DHT.h>
#include <DHT_U.h>
#include <SPI.h>

#include "pins.h"
#include "config.h"
#include "lcd.h"
#include "dht_sensor.h"
#include "moisture_sensor.h"
#include "led.h"
#include "buzzer.h"

#include "wifi_manager.h"
#include "api_client.h"

//========================
// Timers
//========================
unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 2000;

unsigned long lastScreenChange = 0;
const unsigned long SCREEN_INTERVAL = 30000; // 30 seconds

unsigned long lastLedCheck = 0;
const unsigned long LED_CHECK_INTERVAL = 5000; // 5 seconds

unsigned long lastSensorListCheck = 0;
const unsigned long SENSOR_LIST_INTERVAL = 10000; // 10 sec - re-check enabled sensors from server

//========================
// LCD Screens
//========================
byte currentScreen = 0;

void setup()
{
    Serial.begin(115200);

    connectWiFi();

    getEnabledSensors();

    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);

    initPins();

    lcdInit();

    initDHT();

    initMoisture();

    lcdSplashScreen();

    delay(2000);

    lcdDashboard();

    Serial.println("System Ready");
}

void loop()
{
    //========================
    // Keep WiFi Alive
    //========================
    checkWiFi();

    //========================
    // Update Buzzer (non-blocking beep pattern)
    //========================
    updateBuzzer();

    //========================
    // Check Risk Status -> LED (every 5 sec)
    //========================
    if(millis() - lastLedCheck >= LED_CHECK_INTERVAL)
    {
        lastLedCheck = millis();

        checkSystemStatus();
    }

    //========================
    // Re-check Enabled Sensors (every 1 min)
    // Kailangan ito para makita ng ESP32 kapag
    // may na-enable o na-add na sensor sa website
    // nang hindi na kailangang i-restart ang device.
    //========================
    if(millis() - lastSensorListCheck >= SENSOR_LIST_INTERVAL)
    {
        lastSensorListCheck = millis();

        getEnabledSensors();
    }

    //========================
    // Auto Change LCD Screen
    //========================
    if(millis() - lastScreenChange >= SCREEN_INTERVAL)
    {
        lastScreenChange = millis();

        currentScreen++;

        if(currentScreen > 3)
            currentScreen = 0;

        switch(currentScreen)
        {
            case 0:
                lcdDashboard();
                break;

            case 1:
                lcdMoistureScreen();
                break;

            case 2:
                lcdBatchScreen();
                break;

            case 3:
                lcdSystemScreen();
                break;
        }
    }

    //========================
    // Read Sensors every 2 sec
    //========================
    if(millis() - lastSensorRead >= SENSOR_INTERVAL)
    {
        lastSensorRead = millis();

        readDHT();

        readMoisture();

        sendSensorReadings();

        switch(currentScreen)
        {
            case 0:
                lcdUpdate();
                break;

            case 1:
                lcdUpdateMoisture();
                break;

            case 2:
                lcdUpdateBatch();
                break;

            case 3:
                lcdUpdateSystem();
                break;
        }

        //----------------------
        // Serial Debug
        //----------------------

        Serial.println("===== DHT =====");

        for(int i=0;i<4;i++)
        {
            Serial.print("DHT");
            Serial.print(i+1);

            if(dhtSensors[i].connected)
            {
                Serial.print(" : ");

                Serial.print(dhtSensors[i].temperature);

                Serial.print("C ");

                Serial.print(dhtSensors[i].humidity);

                Serial.println("%");
            }
            else
            {
                Serial.println(" OFF");
            }
        }

        Serial.println();

        Serial.println("===== Moisture =====");

        for(int i=0;i<6;i++)
        {
            Serial.print("MS");

            Serial.print(i+1);

            Serial.print(" : ");

            Serial.print(moistureSensors[i].moisturePercent);

            Serial.println("%");
        }

        Serial.println("----------------------------");
    }
}
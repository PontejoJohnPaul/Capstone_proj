#include "api_client.h"
#include "credentials.h"

#include "dht_sensor.h"
#include "moisture_sensor.h"

#include <ArduinoJson.h>

#include <WiFi.h>
#include <HTTPClient.h>

void getEnabledSensors()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi Disconnected");
        return;
    }

    HTTPClient http;

    String url = String(SERVER_URL) + "get_enabled_sensors.php";

    Serial.println();
    Serial.println("==================================");
    Serial.println("Getting Enabled Sensors...");
    Serial.println(url);

    http.begin(url);

    int httpCode = http.GET();

    if (httpCode > 0)
    {
        Serial.print("HTTP Code : ");
        Serial.println(httpCode);

        String payload = http.getString();

        Serial.println("Server Response:");
        Serial.println(payload);

        JsonDocument doc;

        DeserializationError error = deserializeJson(doc, payload);

        if (error)
        {
            Serial.println("JSON Parse Failed!");
            http.end();
            return;
        }

        JsonArray sensors = doc["sensors"];

        for (JsonObject sensor : sensors)
        {
            String code = sensor["sensor_code"].as<String>();
            bool enabled = sensor["enabled"] == "1";

            Serial.print(code);
            Serial.print(" -> ");
            Serial.println(enabled ? "ENABLED" : "DISABLED");

            if (code == "DHT1")
                dhtSensors[0].enabled = enabled;
            else if (code == "DHT2")
                dhtSensors[1].enabled = enabled;
            else if (code == "DHT3")
                dhtSensors[2].enabled = enabled;
            else if (code == "DHT4")
                dhtSensors[3].enabled = enabled;
            else if (code == "MS1")
                moistureSensors[0].enabled = enabled;
            else if (code == "MS2")
                moistureSensors[1].enabled = enabled;
            else if (code == "MS3")
                moistureSensors[2].enabled = enabled;
            else if (code == "MS4")
                moistureSensors[3].enabled = enabled;
            else if (code == "MS5")
                moistureSensors[4].enabled = enabled;
            else if (code == "MS6")
                moistureSensors[5].enabled = enabled;
        }

        Serial.println();
        Serial.println("===== ESP32 Sensor Status =====");

        for (int i = 0; i < 4; i++)
        {
            Serial.print("DHT");
            Serial.print(i + 1);
            Serial.print(" : ");
            Serial.println(dhtSensors[i].enabled ? "ENABLED" : "DISABLED");
        }

        for (int i = 0; i < 6; i++)
        {
            Serial.print("MS");
            Serial.print(i + 1);
            Serial.print(" : ");
            Serial.println(moistureSensors[i].enabled ? "ENABLED" : "DISABLED");
        }
    }
    else
    {
        Serial.print("HTTP Error : ");
        Serial.println(http.errorToString(httpCode));
    }

    http.end();
}

void sendSensorReadings()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi Disconnected");
        return;
    }

    HTTPClient http;

    String url = String(SERVER_URL) + "save_readings.php";

    http.begin(url);

    http.addHeader("Content-Type", "application/json");

    JsonDocument doc;

    JsonArray readings = doc["readings"].to<JsonArray>();

    //--------------------------
    // DHT
    //--------------------------
    for(int i=0;i<4;i++)
    {
        if(!dhtSensors[i].enabled) continue;
        if(!dhtSensors[i].connected) continue;

        JsonObject sensor = readings.add<JsonObject>();

        sensor["sensor_code"] = "DHT" + String(i+1);
        sensor["temperature"] = dhtSensors[i].temperature;
        sensor["humidity"] = dhtSensors[i].humidity;
    }

    //--------------------------
    // Moisture
    //--------------------------
    for(int i=0;i<6;i++)
    {
        if(!moistureSensors[i].enabled) continue;
        if(!moistureSensors[i].connected) continue;

        JsonObject sensor = readings.add<JsonObject>();

        sensor["sensor_code"] = "MS" + String(i+1);
        sensor["moisture"] = moistureSensors[i].moisturePercent;
    }

    String json;

    serializeJson(doc, json);

    Serial.println();
    Serial.println("========== SENDING ==========");
    Serial.println(json);

    int httpCode = http.POST(json);

    Serial.print("HTTP Code : ");
    Serial.println(httpCode);

    if(httpCode > 0)
    {
        String response = http.getString();

        Serial.println(response);
    }

    http.end();
}
#include <WiFi.h>

#include "wifi_manager.h"
#include "credentials.h"

//========================
// Reconnect Timer
//========================
static unsigned long lastWifiRetry = 0;
static const unsigned long WIFI_RETRY_INTERVAL = 10000; // 10 sec between retries

void connectWiFi()
{
    Serial.println();
    Serial.print("Connecting to WiFi");

    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi Connected");

    Serial.print("IP Address : ");
    Serial.println(WiFi.localIP());
}

//========================
// Non-blocking Reconnect Check
//========================
// Call every loop() cycle. If WiFi is down, tries WiFi.reconnect()
// every WIFI_RETRY_INTERVAL ms instead of blocking with delay().
// This keeps sensor reads / LCD updates running smoothly even
// while WiFi is trying to come back.
void checkWiFi()
{
    if (WiFi.status() == WL_CONNECTED)
        return;

    unsigned long now = millis();

    if (now - lastWifiRetry < WIFI_RETRY_INTERVAL)
        return;

    lastWifiRetry = now;

    Serial.println("WiFi Disconnected - attempting reconnect...");

    WiFi.reconnect();
}
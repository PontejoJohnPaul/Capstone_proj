#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

void connectWiFi();

// Call this every loop() cycle. Non-blocking: only attempts a
// reconnect if WiFi is actually down, and only retries every
// WIFI_RETRY_INTERVAL ms so it doesn't spam WiFi.begin().
void checkWiFi();

#endif
#ifndef API_CLIENT_H
#define API_CLIENT_H

void getEnabledSensors();

void sendSensorReadings();

// Fetches get_live_monitoring.php, finds the worst (most severe)
// risk_status among all online sensors, and updates the traffic-light LED.
void checkSystemStatus();

#endif
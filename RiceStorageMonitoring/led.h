#ifndef LED_H
#define LED_H

// status: "SAFE", "WARNING", "DANGER", or "OFFLINE" (walang online sensor -> lahat OFF)
void setLedStatus(const char* status);

#endif
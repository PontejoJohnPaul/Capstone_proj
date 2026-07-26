#include <Arduino.h>
#include <string.h>

#include "led.h"
#include "pins.h"

//=====================================================
// setLedStatus
//=====================================================
// Traffic-light behavior: ONE LED lit at a time.
//   SAFE    -> Green
//   WARNING -> Yellow
//   DANGER  -> Red
//   anything else (OFFLINE / unknown) -> all OFF
//=====================================================
void setLedStatus(const char* status)
{
    // Turn all off first
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);

    if (status == nullptr)
        return;

    if (strcmp(status, "DANGER") == 0)
    {
        digitalWrite(RED_LED, HIGH);
    }
    else if (strcmp(status, "WARNING") == 0)
    {
        digitalWrite(YELLOW_LED, HIGH);
    }
    else if (strcmp(status, "SAFE") == 0)
    {
        digitalWrite(GREEN_LED, HIGH);
    }
    // else: OFFLINE / unknown -> stays all OFF
}
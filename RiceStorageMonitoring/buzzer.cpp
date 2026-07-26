#include <Arduino.h>
#include <string.h>

#include "buzzer.h"
#include "pins.h"

//=====================================================
// Passive buzzer -> needs tone()/noTone() (PWM), NOT
// digitalWrite, since it has no built-in oscillator.
//=====================================================

#define BUZZER_FREQ_HZ 2000

// 0 = silent (SAFE/OFFLINE), 1 = WARNING, 2 = DANGER
static int buzzerLevel = 0;

static unsigned long lastToggle = 0;
static bool toneIsOn = false;

// Kapag may bagong-detect na pagbabago mula SAFE patungong
// WARNING/DANGER, hindi agad tutunog ang buzzer. Maghihintay muna
// ito ng CONFIRM_DELAY_MS (30 sec) -- kung bumalik sa SAFE bago
// matapos ang confirmation window, kanselado ang alarma at hindi na
// ito tutunog. Kung nanatiling WARNING/DANGER pagkalipas ng 30 sec,
// saka lang talaga tutunog ang buzzer. Ito ang umiiwas sa false
// alarm mula sa panandaliang/hindi-tiyak na pagbabago ng reading.
static const unsigned long CONFIRM_DELAY_MS = 30000; // 30 seconds

static bool pending = false;           // naghihintay pa sa loob ng confirmation window
static bool sounding = false;          // nakumpirma na ang alarma, aktibong tumutunog
static unsigned long pendingStartTime = 0;

// WARNING: slow beep-beep
static const unsigned long WARNING_ON_MS  = 200;
static const unsigned long WARNING_OFF_MS = 800;

// DANGER: fast beep-beep
static const unsigned long DANGER_ON_MS  = 100;
static const unsigned long DANGER_OFF_MS = 100;

void setBuzzerStatus(const char* status)
{
    int newLevel = 0;

    if (status != nullptr)
    {
        if (strcmp(status, "DANGER") == 0)
            newLevel = 2;
        else if (strcmp(status, "WARNING") == 0)
            newLevel = 1;
        else
            newLevel = 0; // SAFE / unknown -> silent
    }

    if (newLevel == buzzerLevel)
        return; // walang pagbabago, walang gagawin

    if (newLevel == 0)
    {
        // Bumalik sa SAFE -> kanselahin agad ang alarma, pending man
        // ito o sumisigaw na. Kung nasa loob pa ng 30-sec confirmation
        // window, hindi na ito matutuloy pang tumunog (ito mismo ang
        // umiiwas sa false alarm).
        buzzerLevel = 0;
        pending = false;
        sounding = false;
        noTone(BUZZER_PIN);
        toneIsOn = false;
    }
    else if (buzzerLevel == 0)
    {
        // Bagong-detect na pagbabago mula SAFE patungong WARNING/DANGER.
        // Huwag munang tumunog -- simulan ang 30-segundong confirmation
        // window. Tutunog lang kapag hindi na ito bumalik sa SAFE sa
        // loob ng 30 segundo.
        buzzerLevel = newLevel;
        pending = true;
        sounding = false;
        pendingStartTime = millis();
        noTone(BUZZER_PIN);
        toneIsOn = false;
    }
    else
    {
        // Parehong WARNING/DANGER, pagbago lang ng severity (hal.
        // WARNING -> DANGER o kabaliktaran). Wala nang dapat hintaying
        // 30 sec pa dahil abnormal na talaga -- i-update lang ang
        // level/pattern nang hindi kinakansela ang kasalukuyang
        // pending/sounding state.
        buzzerLevel = newLevel;

        if (sounding)
        {
            // Panibagong simula ng on/off cycle gamit ang bagong pattern
            lastToggle = millis();
            toneIsOn = false;
        }
        // Kung pending pa (hindi pa nakukumpirma), ipagpapatuloy lang
        // ang paghihintay -- ang pendingStartTime ay hindi na babaguhin.
    }
}

void updateBuzzer()
{
    if (buzzerLevel == 0)
    {
        noTone(BUZZER_PIN);
        toneIsOn = false;
        return;
    }

    if (pending)
    {
        if (millis() - pendingStartTime >= CONFIRM_DELAY_MS)
        {
            // Nakumpirma na ang alarma -- nanatiling WARNING/DANGER
            // pagkalipas ng 30 sec. Simulan na ang aktwal na pagtunog.
            pending = false;
            sounding = true;
            lastToggle = millis();
            toneIsOn = false;
        }
        else
        {
            // Nasa loob pa ng confirmation window -- manatiling tahimik.
            return;
        }
    }

    if (!sounding)
        return;

    unsigned long onDuration  = (buzzerLevel == 2) ? DANGER_ON_MS  : WARNING_ON_MS;
    unsigned long offDuration = (buzzerLevel == 2) ? DANGER_OFF_MS : WARNING_OFF_MS;

    unsigned long now = millis();

    if (toneIsOn)
    {
        if (now - lastToggle >= onDuration)
        {
            noTone(BUZZER_PIN);
            toneIsOn = false;
            lastToggle = now;
        }
    }
    else
    {
        if (now - lastToggle >= offDuration)
        {
            tone(BUZZER_PIN, BUZZER_FREQ_HZ);
            toneIsOn = true;
            lastToggle = now;
        }
    }
}
#ifndef BUZZER_H
#define BUZZER_H

// Call this whenever the risk status changes (e.g. inside checkSystemStatus()).
// status: "SAFE", "WARNING", "DANGER", or "OFFLINE"/null -> silent
// NOTE: Kapag bagong-detect na pagbabago mula SAFE patungong
// WARNING/DANGER, HINDI agad tutunog ang buzzer -- maghihintay muna
// ito ng 30 segundo (confirmation window). Kung bumalik sa SAFE bago
// matapos ang 30 sec, kanselado ang alarma at hindi na ito tutunog.
// Kung nanatiling WARNING/DANGER pagkalipas ng 30 sec, doon lang
// talaga tutunog ang buzzer (patuloy hanggang bumalik sa SAFE).
void setBuzzerStatus(const char* status);

// Call this EVERY loop() cycle. Non-blocking - handles the 30-sec
// confirmation window and the on/off beep timing internally using
// millis(), no delay().
void updateBuzzer();

#endif
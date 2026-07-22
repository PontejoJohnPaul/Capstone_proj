#ifndef CONFIG_H
#define CONFIG_H

//========================
// Thresholds
//========================

#define TEMP_THRESHOLD 32.0

#define HUM_THRESHOLD 80.0

#define MOISTURE_THRESHOLD 65

//========================
// Moisture Calibration
//========================

// Babaguhin natin ito pagkatapos ng actual calibration
#define MOISTURE_DRY 3200

#define MOISTURE_WET 1200

//========================
// Fan Control
//========================

#define FAN_ON HIGH

#define FAN_OFF LOW

//========================
// Buzzer
//========================

#define BUZZER_ON HIGH

#define BUZZER_OFF LOW

#endif
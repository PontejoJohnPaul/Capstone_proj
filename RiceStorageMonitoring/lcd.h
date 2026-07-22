#ifndef LCD_H
#define LCD_H

#include <TFT_eSPI.h>

extern TFT_eSPI tft;

//========================
// Initialization
//========================

void lcdInit();

void lcdSplashScreen();

//========================
// Screens
//========================

void lcdDashboard();

void lcdMoistureScreen();

void lcdBatchScreen();

void lcdSystemScreen();

//========================
// Updates
//========================

void lcdUpdate();

void lcdUpdateMoisture();

void lcdUpdateBatch();

void lcdUpdateSystem();

#endif
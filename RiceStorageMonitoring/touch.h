#ifndef TOUCH_H
#define TOUCH_H

#include <XPT2046_Touchscreen.h>
#include "pins.h"

extern XPT2046_Touchscreen ts;

extern int touchX;
extern int touchY;
extern bool touchPressed;

void touchInit();
void touchUpdate();
bool touchInArea(int x, int y, int w, int h);

#endif
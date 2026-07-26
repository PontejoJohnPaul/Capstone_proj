#include "touch.h"

// No IRQ pin — T_IRQ not connected
XPT2046_Touchscreen ts(TOUCH_CS);

int touchX = 0;
int touchY = 0;
bool touchPressed = false;

void touchInit()
{
    // SPI already initialized by TFT_eSPI — do not reinitialize
    ts.begin();
    ts.setRotation(1);
    Serial.println("Touch Ready");
}

void touchUpdate()
{
    touchPressed = false;

    if (ts.touched())
    {
        TS_Point p = ts.getPoint();

        // Debug — print raw values
        Serial.print("RAW -> X=");
        Serial.print(p.x);
        Serial.print(" Y=");
        Serial.print(p.y);
        Serial.print(" Z=");
        Serial.println(p.z);

        // Filter ghost touches — floating IRQ causes Z > 3500
        if (p.z > 3500) return;

        touchX = map(p.x, 200, 3900, 0, 320);
        touchY = map(p.y, 240, 3800, 0, 240);

        touchX = constrain(touchX, 0, 319);
        touchY = constrain(touchY, 0, 239);

        touchPressed = true;

        Serial.print("Touch -> X=");
        Serial.print(touchX);
        Serial.print(" Y=");
        Serial.println(touchY);

        delay(200);
    }
}

// Returns true if the last touch was inside the given rectangle
bool touchInArea(int x, int y, int w, int h)
{
    return touchPressed      &&
           touchX >= x       &&
           touchX <= (x + w) &&
           touchY >= y       &&
           touchY <= (y + h);
}
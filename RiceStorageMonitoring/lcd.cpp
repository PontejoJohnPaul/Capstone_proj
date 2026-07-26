#include "lcd.h"
#include "dht_sensor.h"
#include "moisture_sensor.h"

TFT_eSPI tft = TFT_eSPI();

// ---- Shared design palette ----
#define COL_BG        TFT_BLACK
#define COL_HEADER_BG 0x0320      // dark green (custom 565)
#define COL_HEADER_TX TFT_WHITE
#define COL_ACCENT    TFT_GREENYELLOW
#define COL_LABEL     TFT_CYAN
#define COL_VALUE     TFT_WHITE
#define COL_OFF       TFT_RED
#define COL_CARD_BD   TFT_DARKGREY
#define COL_FOOTER_BG 0x18E3      // very dark grey
#define COL_FOOTER_TX TFT_YELLOW

static void drawHeader(const char* title)
{
    tft.fillRect(0, 0, 320, 32, COL_HEADER_BG);
    tft.drawFastHLine(0, 32, 320, COL_ACCENT);

    tft.setTextColor(COL_HEADER_TX, COL_HEADER_BG);
    tft.setTextSize(2);
    tft.drawCentreString(title, 160, 8, 2);
}

static void drawFooter(const char* text)
{
    tft.fillRect(0, 218, 320, 22, COL_FOOTER_BG);
    tft.setTextColor(COL_FOOTER_TX, COL_FOOTER_BG);
    tft.setTextSize(1);
    tft.drawCentreString(text, 160, 225, 2);
}

void lcdInit()
{
    tft.init();
    tft.setRotation(1);
    tft.fillScreen(COL_BG);
}

//=====================================================
// Splash Screen
//=====================================================

void lcdSplashScreen()
{
    tft.fillScreen(COL_BG);

    // simple framed border
    tft.drawRoundRect(10, 10, 300, 220, 8, COL_ACCENT);

    tft.setTextColor(COL_ACCENT);
    tft.setTextSize(3);
    tft.drawCentreString("GrainSense", 160, 70, 2);

    tft.drawFastHLine(60, 110, 200, COL_CARD_BD);

    tft.setTextColor(COL_HEADER_TX);
    tft.setTextSize(2);
    tft.drawCentreString("Rice Storage", 160, 130, 2);
    tft.drawCentreString("Monitoring", 160, 155, 2);

    tft.setTextColor(COL_FOOTER_TX);
    tft.setTextSize(1);
    tft.drawCentreString("Initializing...", 160, 200, 2);
}

//=====================================================
// Dashboard (DHT)
//=====================================================

void lcdDashboard()
{
    tft.fillScreen(COL_BG);

    drawHeader("DHT Monitoring");

    const int rowH   = 40;
    const int startY = 42;

    for (int i = 0; i < 4; i++)
    {
        int y = startY + (i * rowH);

        // card outline per sensor row
        tft.drawRoundRect(8, y, 304, rowH - 6, 6, COL_CARD_BD);

        tft.setTextColor(COL_LABEL, COL_BG);
        tft.setTextSize(2);
        tft.setCursor(18, y + 9);
        tft.print("DHT");
        tft.print(i + 1);
    }

    drawFooter("Auto changing every 30 sec");

    tft.setTextColor(COL_VALUE);
}

//=====================================================
// Update DHT
//=====================================================

void lcdUpdate()
{
    const int rowH   = 40;
    const int startY = 42;

    for (int i = 0; i < 4; i++)
    {
        int y = startY + (i * rowH);

        tft.fillRect(110, y + 4, 195, 24, COL_BG);

        tft.setTextSize(2);
        tft.setCursor(110, y + 9);

        if (dhtSensors[i].connected)
        {
            tft.setTextColor(COL_VALUE, COL_BG);
            tft.printf("%4.1fC  %4.1f%%",
                       dhtSensors[i].temperature,
                       dhtSensors[i].humidity);
        }
        else
        {
            tft.setTextColor(COL_OFF, COL_BG);
            tft.print("OFFLINE");
        }
    }
}

//=====================================================
// Moisture Screen
//=====================================================

void lcdMoistureScreen()
{
    tft.fillScreen(COL_BG);

    drawHeader("Moisture Sensors");

    const int rowH   = 30;
    const int startY = 40;

    for (int i = 0; i < 6; i++)
    {
        int y = startY + (i * rowH);

        tft.drawRoundRect(8, y, 304, rowH - 4, 5, COL_CARD_BD);

        tft.setTextColor(COL_LABEL, COL_BG);
        tft.setTextSize(2);
        tft.setCursor(18, y + 5);
        tft.print("MS");
        tft.print(i + 1);
    }

    drawFooter("Auto changing every 30 sec");

    tft.setTextColor(COL_VALUE);
}

//=====================================================
// Update Moisture
//=====================================================

void lcdUpdateMoisture()
{
    const int rowH   = 30;
    const int startY = 40;

    for (int i = 0; i < 6; i++)
    {
        int y = startY + (i * rowH);

        tft.fillRect(90, y + 3, 215, 22, COL_BG);

        tft.setTextSize(2);
        tft.setCursor(90, y + 5);

        if (moistureSensors[i].connected)
        {
            tft.setTextColor(COL_VALUE, COL_BG);
            tft.print(moistureSensors[i].moisturePercent);
            tft.print("%");
        }
        else
        {
            tft.setTextColor(COL_OFF, COL_BG);
            tft.print("OFFLINE");
        }
    }
}

//=====================================================
// Batch Screen
//=====================================================

void lcdBatchScreen()
{
    tft.fillScreen(COL_BG);

    drawHeader("Current Batch");

    tft.drawRoundRect(30, 60, 260, 130, 8, COL_CARD_BD);

    tft.setTextColor(COL_LABEL);
    tft.setTextSize(2);
    tft.drawCentreString("Waiting for", 160, 95, 2);
    tft.drawCentreString("Mobile App", 160, 120, 2);

    tft.setTextColor(COL_ACCENT);
    tft.setTextSize(1);
    tft.drawCentreString("Sync batch data via app", 160, 150, 2);

    drawFooter("Auto changing every 30 sec");
}

//=====================================================
// Update Batch
//=====================================================

void lcdUpdateBatch()
{
    // Placeholder
}

//=====================================================
// System Screen
//=====================================================

void lcdSystemScreen()
{
    tft.fillScreen(COL_BG);

    drawHeader("System Status");

    const char* labels[4] = { "WiFi", "Database", "Relay", "Buzzer" };
    const int rowH   = 40;
    const int startY = 42;

    for (int i = 0; i < 4; i++)
    {
        int y = startY + (i * rowH);

        tft.drawRoundRect(8, y, 304, rowH - 6, 6, COL_CARD_BD);

        tft.setTextColor(COL_LABEL, COL_BG);
        tft.setTextSize(2);
        tft.setCursor(18, y + 9);
        tft.print(labels[i]);
        tft.print(":");
    }
}

//=====================================================
// Update System
//=====================================================

void lcdUpdateSystem()
{
    const int rowH   = 40;
    const int startY = 42;

    const char* values[4] = { "Connected", "Online", "OFF", "OFF" };
    bool isGood[4] = { true, true, false, false };

    for (int i = 0; i < 4; i++)
    {
        int y = startY + (i * rowH);

        tft.fillRect(150, y + 4, 155, 24, COL_BG);

        tft.setTextSize(2);
        tft.setCursor(150, y + 9);
        tft.setTextColor(isGood[i] ? COL_VALUE : COL_OFF, COL_BG);
        tft.print(values[i]);
    }
}
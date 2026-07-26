document.addEventListener("DOMContentLoaded", function () {

    const cards = document.querySelectorAll(".monitor-card");

    // FIX: instead of resetting a "startedAt" timestamp to Date.now()
    // on every successful poll (which made "Last updated" say
    // "Just now" forever, even for a dead sensor), we now track the
    // REAL elapsed time reported by the backend (seconds_since_update,
    // computed server-side from sensor_latest.updated_at).
    //
    // lastKnown.set(card, { baseSeconds, receivedAtLocal })
    //   baseSeconds     -> seconds_since_update as of the last poll
    //   receivedAtLocal -> client Date.now() when that poll arrived
    //
    // The 1-second ticker below just adds elapsed local time on top
    // of baseSeconds, so the counter keeps ticking smoothly between
    // polls but is always anchored to the real DB timestamp.
    const lastKnown = new Map();

    //---------------------------------------
    // Status badge
    //
    // FIX: get_live_monitoring.php already computes the correct
    // risk_status (SAFE/WARNING/DANGER) server-side, using the
    // proper zone-based logic against sensor_thresholds (same
    // logic the ESP32 LED/buzzer now relies on too). We used to
    // recompute this AGAIN here on the client using a different
    // band-based formula and a separate get_thresholds.php fetch —
    // that duplicate logic could disagree with the backend (and
    // was the reason the badge could get stuck on SAFE regardless
    // of the actual reading). Now we just display what the backend
    // already decided. One source of truth, no more drift.
    //---------------------------------------

    const BADGE = {
        "DANGER":  {text:"DANGER",  color:"bg-danger"},
        "WARNING": {text:"WARNING", color:"bg-warning text-dark"},
        "SAFE":    {text:"SAFE",    color:"bg-success"}
    };

    function getBadge(riskStatus)
    {
        return BADGE[riskStatus] || {text:"UNKNOWN", color:"bg-secondary"};
    }

    function formatElapsed(seconds)
    {
        if(seconds === null || seconds === undefined)
            return "Never";

        if(seconds < 60)
            return seconds <= 2 ? "Just now" : seconds + " sec ago";

        if(seconds < 3600)
            return Math.floor(seconds / 60) + " min ago";

        return Math.floor(seconds / 3600) + " hr ago";
    }

    function loadMonitoring()
    {
        fetch("../api/get_live_monitoring.php")
        .then(response => response.json())
        .then(result => {

            if(!result.success) return;

            result.sensors.forEach(sensor => {

                const card = document.querySelector(
                    '.monitor-card[data-sensor-id="'+sensor.sensor_id+'"]'
                );

                if(!card) return;

                // Track real elapsed time for this card regardless of status
                lastKnown.set(card, {
                    baseSeconds: sensor.seconds_since_update,
                    receivedAtLocal: Date.now()
                });

                //---------------------------------------
                // Disabled Sensor
                //---------------------------------------

                if(sensor.status === "disabled")
                {
                    const badge = card.querySelector(".status-badge");
                    badge.className="badge bg-secondary status-badge";
                    badge.innerHTML="Disabled";

                    const temp = card.querySelector(".temperature-value");
                    const hum = card.querySelector(".humidity-value");
                    const moisture = card.querySelector(".moisture-value");

                    if(temp) temp.innerHTML = "--";
                    if(hum) hum.innerHTML = "--";
                    if(moisture) moisture.innerHTML = "--";

                    return;
                }

                //---------------------------------------
                // No Signal (enabled, but nothing fresh -
                // disconnected/unplugged or never reported)
                //---------------------------------------

                if(sensor.status === "no_signal")
                {
                    const badge = card.querySelector(".status-badge");
                    badge.className="badge bg-warning text-dark status-badge";
                    badge.innerHTML="No Signal";

                    const temp = card.querySelector(".temperature-value");
                    const hum = card.querySelector(".humidity-value");
                    const moisture = card.querySelector(".moisture-value");

                    // Do NOT show the old value here, it would be misleading.
                    if(temp) temp.innerHTML = "--";
                    if(hum) hum.innerHTML = "--";
                    if(moisture) moisture.innerHTML = "--";

                    return;
                }

                //---------------------------------------
                // Online -> DHT
                //---------------------------------------

                if(sensor.sensor_type=="DHT")
                {
                    const temp = card.querySelector(".temperature-value");

                    const hum = card.querySelector(".humidity-value");

                    if(temp)
                        temp.innerHTML =
                            sensor.temperature!==null ?
                            sensor.temperature.toFixed(1)+"°C" :
                            "--";

                    if(hum)
                        hum.innerHTML =
                            sensor.humidity!==null ?
                            sensor.humidity.toFixed(1)+"%" :
                            "--";
                }

                //---------------------------------------
                // Online -> Moisture
                //---------------------------------------

                if(sensor.sensor_type=="MOISTURE")
                {
                    const moisture =
                        card.querySelector(".moisture-value");

                    if(moisture)
                        moisture.innerHTML =
                            sensor.moisture!==null ?
                            sensor.moisture.toFixed(1)+"%" :
                            "--";
                }

                //---------------------------------------
                // Badge - straight from the backend's risk_status
                //---------------------------------------

                const status = getBadge(sensor.risk_status);

                const badge=card.querySelector(".status-badge");

                badge.className="badge status-badge "+status.color;

                badge.innerHTML=status.text;

            });

        })
        .catch(function(error){
            console.log(error);
        });
    }

    //---------------------------------------
    // Update "Last updated" Text
    //
    // FIX: now driven by the REAL seconds_since_update from the
    // backend (base) plus however much local time has passed since
    // that poll arrived -- not just reset to "Just now" on every tick.
    //---------------------------------------

    setInterval(function(){

        cards.forEach(function(card){

            const label=card.querySelector(".last-updated-time");

            if(!label) return;

            const known = lastKnown.get(card);

            if(!known)
            {
                label.innerHTML = "Loading...";
                return;
            }

            if(known.baseSeconds === null || known.baseSeconds === undefined)
            {
                label.innerHTML = "Never";
                return;
            }

            const localElapsed = Math.floor((Date.now() - known.receivedAtLocal) / 1000);
            const totalElapsed = known.baseSeconds + localElapsed;

            label.innerHTML = formatElapsed(totalElapsed);

        });

    },1000);

    //---------------------------------------
    // Start polling sensor readings every 2 seconds
    // (risk_status now comes straight from the backend,
    // no separate thresholds fetch needed)
    //---------------------------------------

    loadMonitoring();

    setInterval(loadMonitoring,2000);

});
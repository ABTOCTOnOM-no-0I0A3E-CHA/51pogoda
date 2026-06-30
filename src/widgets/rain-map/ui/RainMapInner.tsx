const WINDY_URL =
  "https://embed.windy.com/embed2.html" +
  "?lat=68.97&lon=33.07" +
  "&detailLat=68.97&detailLon=33.07" +
  "&zoom=7&level=surface&overlay=rain" +
  "&product=ecmwf&type=map&location=coordinates" +
  "&metricWind=m%2Fs&metricTemp=%C2%B0C" +
  "&calendar=now&radarRange=-1";

/* Заполняет родительский контейнер целиком — размер задаёт обёртка (квадрат на главной) */
export function RainMapInner() {
  return (
    <iframe
      src={WINDY_URL}
      title="Карта осадков — windy.com"
      loading="lazy"
      style={{ border: "none", display: "block", width: "100%", height: "100%" }}
      allowFullScreen
    />
  );
}

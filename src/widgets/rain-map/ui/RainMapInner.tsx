interface Props {
  height?: number;
}

const WINDY_URL =
  "https://embed.windy.com/embed2.html" +
  "?lat=68.97&lon=33.07" +
  "&detailLat=68.97&detailLon=33.07" +
  "&zoom=7&level=surface&overlay=rain" +
  "&product=ecmwf&type=map&location=coordinates" +
  "&metricWind=m%2Fs&metricTemp=%C2%B0C" +
  "&calendar=now&radarRange=-1";

export function RainMapInner({ height = 380 }: Props) {
  return (
    <iframe
      src={WINDY_URL}
      width="100%"
      height={height}
      style={{ border: "none", display: "block" }}
      allowFullScreen
    />
  );
}

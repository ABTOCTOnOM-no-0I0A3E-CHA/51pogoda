import { CITIES, getCapital, getRegionCities } from "@/entities/city";
import { getCityWeather, getCitiesWeather } from "@/entities/weather";
import { getDaylight } from "@/shared/lib/daylight";
import { HomeHero } from "@/widgets/home-hero";
import { CitiesGrid } from "@/widgets/cities-grid";
import { LocationsCatalog } from "@/widgets/locations-catalog";
import { SiteFooter } from "@/widgets/site-footer";

export async function HomePage() {
  const capital = getCapital();

  const [capitalWeather, regionItems] = await Promise.all([
    getCityWeather(capital),
    getCitiesWeather(getRegionCities()),
  ]);

  const daylight = getDaylight(capital.lat, new Date());

  return (
    <div className="content-padding" style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 24px 80px" }}>
      <HomeHero city={capital} weather={capitalWeather} daylight={daylight} />
      <CitiesGrid items={regionItems} />
      <LocationsCatalog items={CITIES} excludeKinds={["город"]} id="vse-tochki" />
      <SiteFooter />
    </div>
  );
}

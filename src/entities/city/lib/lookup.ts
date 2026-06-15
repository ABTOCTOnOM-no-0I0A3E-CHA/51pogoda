import { CITIES } from "../model/cities";
import type { City } from "../model/types";

const BY_YR_ID = new Map(CITIES.map((c) => [c.yrId, c]));

export function getCityByYrId(yrId: string): City | undefined {
  return BY_YR_ID.get(yrId);
}

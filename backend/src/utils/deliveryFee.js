import { db } from "../database/index.js";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";
import calculateDistance from "./getDistance.js";
const getDeliveryFee = async (destination_address_id, restaurant_id) => {
  const [source] = await db.execute("select latitude,longitude from restaurants where restaurant_id=?", [restaurant_id]);
  const [dest] = await db.execute("select latitude,longitude from addresses where address_id=?", [destination_address_id]);
  if (source.length === 0 || dest === 0) {
    throw new ApiError(400, "Invalid addresses");
  }

  const sourceLatitude = source[0].latitude;
  const sourceLongitude = source[0].longitude;

  const destLatitude = dest[0].latitude;
  const destLongitude = dest[0].longitude;

  const dLat = destLatitude - sourceLatitude;
  const dLong = destLatitude - sourceLongitude;

  const distance = calculateDistance(sourceLatitude, sourceLongitude, destLatitude, destLongitude);

  const roundedDistance = Number(distance.toFixed(2));

  const [rules] = await db.execute("select * from delivery_fee_rules where is_active=1 and ? between min_km and max_km", [roundedDistance]);

  const rule = rules[0];

  const deliveryFee =Number(rule.base_fee) +(Number(roundedDistance) - Number(rule.min_km)) *Number(rule.per_km_charge);

  const finalFee = deliveryFee * Number(rule.surge_multiplier);

  return Number(finalFee.toFixed(2));
}

export default getDeliveryFee;
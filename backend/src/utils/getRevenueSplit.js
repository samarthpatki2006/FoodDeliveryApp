const RESTAURANT_SHARE = 0.85;
const DELIVERY_PARTNER_SHARE = 0.95;

const computeSplit = (subTotal, deliveryFee) => {
  const restaurantShare = subTotal * RESTAURANT_SHARE;
  const partnerShare = deliveryFee * DELIVERY_PARTNER_SHARE;

  const restaurantCommission = subTotal - restaurantShare;
  const deliveryCommission = deliveryFee - partnerShare;

  const platformShare = restaurantCommission + deliveryCommission;

  return {
    restaurantShare,
    partnerShare,
    platformShare
  };
};

export default computeSplit;
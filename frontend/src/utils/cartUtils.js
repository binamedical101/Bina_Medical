export const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

export const updateCart = (state, settings = null) => {
  // Use settings if provided, else fallback to defaults
  const taxRate = settings?.taxRate ?? 18;
  const baseShippingFee = settings?.shippingFee ?? 50;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 1000;

  // Calculate the item price, applying the discountPercentage
  const calculateItemPrice = (item) => {
    const basePrice = item.price;
    if (item.discountPercentage > 0) {
      return basePrice * (1 - item.discountPercentage / 100);
    }
    return basePrice;
  };

  // Calculate prices
  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => acc + calculateItemPrice(item) * item.qty, 0)
  );

  // Calculate coupon discount if coupon is applied
  let discount = 0;
  if (state.coupon) {
    const itemsPriceNum = Number(state.itemsPrice);
    if (itemsPriceNum >= state.coupon.minPurchaseAmount) {
      if (state.coupon.discountType === 'percentage') {
        let pctDiscount = itemsPriceNum * (state.coupon.discountAmount / 100);
        if (state.coupon.maxDiscountAmount) {
          pctDiscount = Math.min(pctDiscount, state.coupon.maxDiscountAmount);
        }
        discount = pctDiscount;
      } else if (state.coupon.discountType === 'fixed') {
        discount = state.coupon.discountAmount;
      }
      discount = Math.min(discount, itemsPriceNum);
    }
  }
  state.couponDiscount = addDecimals(discount);

  const discountedSubtotal = Number(state.itemsPrice) - discount;

  // Free shipping over threshold, else base fee
  state.shippingPrice = addDecimals(discountedSubtotal > freeShippingThreshold ? 0 : baseShippingFee);
  
  // Tax calculation
  state.taxPrice = addDecimals(Number(((taxRate / 100) * discountedSubtotal).toFixed(2)));

  state.totalPrice = (
    discountedSubtotal +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  ).toFixed(2);

  localStorage.setItem('cart', JSON.stringify(state));

  return state;
};

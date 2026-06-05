const getTaxAmount=(price)=>{
  return Number((0.18*Number(price)).toFixed(2));
}
export default getTaxAmount;
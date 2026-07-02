import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import getDeliveryFee from "../utils/deliveryFee.js";
import getTaxAmount from "../utils/taxAmount.js";
import generateSecureRef from "../utils/transactionReference.js";

const addAddressDetails = asyncHandler(async (req, res) => {
  const {
    label,
    address_line,
    city,
    state,
    pincode,
    latitude,
    longitude,
  } = req.body;

  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }

  const addressDetails = [
    label,
    address_line,
    city,
    state,
    pincode,
    latitude,
    longitude,
  ];

  addressDetails.forEach((details) => {
    if (!details || String(details).trim() === "") {
      throw new ApiError(401, "All the fields are required");
    }
  });

  const [existingAddress] = await db.execute(
    "select address_id from addresses where user_id=? and label=?",
    [req.user[0].user_id, label]
  );

  if (existingAddress.length > 0) {
    throw new ApiError(400, "Address already exists");
  }

  await db.execute(
    "insert into addresses (user_id,label,address_line,city,state,pincode,latitude,longitude) values(?,?,?,?,?,?,?,?)",
    [
      req.user[0].user_id,
      label,
      address_line,
      city,
      state,
      pincode,
      latitude,
      longitude,
    ]
  );

  const [insertedAddress] = await db.execute(
    "select address_id,user_id,label,address_line,city,state,pincode,latitude,longitude from addresses where user_id=? and label=?",
    [req.user[0].user_id, label]
  );

  if (insertedAddress.length === 0) {
    throw new ApiError(
      400,
      "Something went wrong while inserting address"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        insertedAddress,
        "Address inserted successfully"
      )
    );
});

const getRestaurantsInMyCity = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized Request");
  }
  const { address_id } = req.query;
  let restaurants;
  if (!address_id) {
    const [possibleAddresses]=await db.execute("select label,city from addresses where user_id=?",[req.user[0].user_id]);
    if(possibleAddresses.length===0){
      [restaurants]=await db.execute("select * from restaurants order by rating desc limit 5");
    }
    else{
      [restaurants] = await db.execute(
      "select * from restaurants where lower(city) in (select lower(city) from addresses where user_id=? ) order by rating_avg desc;",[req.user[0].user_id]);
    }
  }
  else {
    const [rows] = await db.execute("select city from addresses where address_id=?;", [address_id]);

    if (rows.length === 0) {
      throw new ApiError(400, "Invalid address");
    }

    [restaurants] = await db.execute("select * from restaurants where lower(city)=lower(?) order by rating_avg desc;",[rows[0].city]);
  }


  if (restaurants.length === 0) {
    throw new ApiError(400, "No restaurants found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, restaurants, "Restaurants fetched"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { order_status_id } = req.query;

  let orders;

  if (order_status_id) {
    [orders] = await db.execute(
      "select o.*,restaurant_name from orders o join restaurants r on o.restaurant_id=r.restaurant_id where user_id=? and order_status_id=?",
      [req.user[0].user_id, Number(order_status_id)]
    );
  } else {
    [orders] = await db.execute(
      "select o.*,restaurant_name from orders o join restaurants r on o.restaurant_id=r.restaurant_id where user_id=?",
      [req.user[0].user_id]
    );
  }

  if (orders.length === 0) {
    throw new ApiError(400, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getMyPaymentHistory = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { payment_status_id } = req.query;

  let payments;

  if (payment_status_id) {
    [payments] = await db.execute(
      "select * from payments natural join orders where user_id=? and payment_status_id=?",
      [req.user[0].user_id, payment_status_id]
    );
  } else {
    [payments] = await db.execute(
      "select * from payments natural join orders where user_id=?",
      [req.user[0].user_id]
    );
  }

  if (payments.length === 0) {
    throw new ApiError(400, "No payments found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

const addItemToCart = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { quantity, restaurant_id, menu_item_id } = req.body;

  const [existingCart] = await db.execute(
    "select cart_id from carts where user_id=? and restaurant_id=?",
    [req.user[0].user_id, restaurant_id]
  );

  if (existingCart.length > 0) {
    const [existingMenu] = await db.execute(
      "select * from cart_items where cart_id=? and menu_item_id=?",
      [existingCart[0].cart_id, menu_item_id]
    );

    if (existingMenu.length > 0) {
      await db.execute(
        "update cart_items set quantity=? where cart_id=? and menu_item_id=?",
        [
          Number(quantity) + Number(existingMenu[0].quantity),
          existingCart[0].cart_id,
          menu_item_id,
        ]
      );
    } else {
      await db.execute(
        "insert into cart_items(cart_id,menu_item_id,quantity) values(?,?,?)",
        [existingCart[0].cart_id, menu_item_id, quantity]
      );
    }
  } else {
    await db.execute(
      "insert into carts (user_id,restaurant_id) values (?,?)",
      [req.user[0].user_id, restaurant_id]
    );

    const [newCart] = await db.execute(
      "select cart_id from carts where user_id=? and restaurant_id=?",
      [req.user[0].user_id, restaurant_id]
    );

    await db.execute(
      "insert into cart_items(cart_id,menu_item_id,quantity) values(?,?,?)",
      [newCart[0].cart_id, menu_item_id, quantity]
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Cart updated successfully"));
});

const updateCartQuantity = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { cart_item_id, cart_id, quantity } = req.body;
  const [cart]=await db.execute("select cart_id from carts where user_id=? and cart_id=?",[req.user[0].user_id,cart_id]);

  if(cart.length===0){
    throw new ApiError(400,"Invalid cart");
  }

  const [cartItem] = await db.execute("select cart_item_id,menu_item_id,quantity from cart_items where cart_item_id=? and cart_id=?", [cart_item_id, cart_id]);

  if (cartItem.length === 0) {
    throw new ApiError(400, "Invalid cart id or cart item does not belong to user");
  }
  
  if (quantity === 0) {
    const [items] = await db.execute("select count(distinct menu_item_id) as count from cart_items where cart_id=?", [cart_id]);

    if (items[0].count === 1) {
      await db.execute("delete from carts where cart_id=?", [cart_id]);
    }
    else {
      await db.execute("delete from cart_items where cart_item_id=?", [cart_item_id]);
    }
  }
  else {
    const [affectedRows] = await db.execute("update cart_items set quantity=? where cart_item_id=? and cart_id=?", [quantity, cart_item_id, cart_id]);
  }
  return res.status(200).json(new ApiResponse(200, {}, "Cart updated successfully"));
})

const deleteCartItem = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }
  const { cart_item_id, cart_id } = req.params;

  const [cartItem] = await db.execute("select user_id,cart_item_id,carts.cart_id from cart_items join carts on carts.cart_id=cart_items.cart_id where cart_items.cart_item_id=? and carts.cart_id=? and user_id=?", [cart_item_id, cart_id, req.user[0].user_id]);

  if (cartItem.length === 0) {
    throw new ApiError(400, "Invalid cart or cart item");
  }

  await db.execute("delete from cart_items where cart_id=? and cart_item_id=?", [cart_id, cart_item_id]);

  const [countRemainingItems] = await db.execute("select count(distinct cart_item_id) as count from cart_items where cart_id=?", [cart_id]);

  if (countRemainingItems[0].count === 0) {
    await db.execute("delete from carts where cart_id=?", [cart_id]);
  }
  res.status(200).json(new ApiResponse(200, {}, "Cart item deleted successfully"));
})

const deleteCart = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { cart_id } = req.params;
  if(!cart_id){
    throw new ApiError(400,"Cart information required");
  }
  const [cart] = await db.execute("select user_id,cart_id from carts where user_id=? and cart_id=?", [req.user[0].user_id, cart_id]);

  if (cart.length === 0) {
    throw new ApiError(400, "Invalid cart id or unauthorized cart access");
  }
  const [affectedRows] = await db.execute("delete from carts where cart_id=?", [cart_id]);

  if (affectedRows.length === 0) {
    throw new ApiError(400, "Something went wrong");
  }
  res.status(200).json(new ApiResponse(200, {}, "Cart deleted successfully"));
})
const placeOrderFromCart = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }

  const {
    cart_id,
    payment_method_id,
    special_instructions,
    delivery_address_id,
    provider
  } = req.body;

  const [existingCart] = await db.execute(
    "select * from carts where cart_id=? and user_id=?",
    [cart_id, req.user[0].user_id]
  );

  if (existingCart.length === 0) {
    throw new ApiError(
      400,
      "Cart not found or unauthorized request"
    );
  }

  const [orderItems] = await db.execute(
    `select ci.menu_item_id,
    ci.quantity,
    mi.price,
    mi.item_name
    from cart_items ci
    join menu_items mi
    on ci.menu_item_id=mi.menu_item_id
    where ci.cart_id=?`,
    [cart_id]
  );

  if (orderItems.length === 0) {
    throw new ApiError(400, "No items in cart");
  }

  let itemPrice = 0;

  orderItems.forEach((item) => {
    itemPrice += item.quantity * item.price;
  });
  
  const delivery_fee = await getDeliveryFee(
    delivery_address_id,
    existingCart[0].restaurant_id
  );

  const taxAmount = await getTaxAmount(
    itemPrice + delivery_fee
  );
  
  const totalAmount = itemPrice + delivery_fee + taxAmount;

  const [orderResult] = await db.execute(
    `insert into orders
    (user_id,restaurant_id,delivery_address_id,
    payment_method_id,subtotal,total_amount,delivery_fee,
    tax_amount,special_instructions)
    values (?,?,?,?,?,?,?,?,?)`,
    [
      req.user[0].user_id,
      existingCart[0].restaurant_id,
      delivery_address_id,
      payment_method_id,
      itemPrice,
      totalAmount,
      delivery_fee,
      taxAmount,
      special_instructions.trim()!=="" ? special_instructions.trim():"",
    ]
  );

  const order_id = orderResult.insertId;

  const values = orderItems.map((item) => [
    order_id,
    item.menu_item_id,
    item.item_name,
    item.price,
    item.quantity
  ]);

  await db.query(
    `insert into order_items
    (order_id,menu_item_id,item_name,item_price,quantity)
    values ?`,
    [values]
  );

  await db.execute(
    "delete from cart_items where cart_id=?",
    [cart_id]
  );

  await db.execute("delete from carts where cart_id=?", [
    cart_id,
  ]);

  const transactionRef=generateSecureRef();

  await db.execute("insert into payments(order_id,provider,transaction_id,amount,payment_status_id) values(?,?,?,?,?)",[order_id,provider,transactionRef,totalAmount,2]);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Order placed successfully"));
});

const placeOrder = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { menu_item_id, delivery_address_id, special_instructions, quantity, payment_method_id,provider } = req.body;

  const details = [
    menu_item_id,
    delivery_address_id,
    quantity,
    payment_method_id,
  ];

  details.forEach((detail) => {
    if (!detail || String(detail).trim() === "") {
      throw new ApiError(400, "All fields are required");
    }
  });

  const [menuItem] = await db.execute(
    "select menu_item_id,item_name,restaurant_id,price from menu_items where menu_item_id=?",
    [menu_item_id]
  );

  if (menuItem.length === 0) {
    throw new ApiError(400, "Menu item not found");
  }

  const itemPrice =
    Number(quantity) * Number(menuItem[0].price);

  const delivery_fee = await getDeliveryFee(
    delivery_address_id,
    menuItem[0].restaurant_id
  );

  const taxAmount = await getTaxAmount(
    itemPrice + delivery_fee
  );

  const totalAmount =
    itemPrice + delivery_fee + taxAmount;

  const [orderResult] = await db.execute(
    `insert into orders
    (user_id,restaurant_id,delivery_address_id,
    payment_method_id,subtotal,delivery_fee,
    tax_amount,total_amount,special_instructions)
    values (?,?,?,?,?,?,?,?,?)`,
    [
      req.user[0].user_id,
      menuItem[0].restaurant_id,
      delivery_address_id,
      payment_method_id,
      itemPrice,
      delivery_fee,
      taxAmount,
      totalAmount,
      special_instructions,
    ]
  );

  const order_id = orderResult.insertId;
  await db.execute(
    `insert into order_items
    (order_id,menu_item_id,item_name,item_price,quantity)
    values(?,?,?,?,?)`,
    [
      order_id,
      menu_item_id,
      menuItem[0].item_name,
      menuItem[0].price,
      quantity,
    ]
  );

  const transactionRef=generateSecureRef();

  await db.execute("insert into payments(order_id,provider,transaction_id,amount,payment_status_id) values(?,?,?,?,?)",[order_id,provider,transactionRef,totalAmount,2]);

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Order placed successfully"));
});

const getMenuItems=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorized request");
  }
  const {address_id}=req.query;
  let menuItems;
  if(address_id){
    const [rows]=await db.execute("select city from addresses where address_id=?",[address_id]);
    if(rows.length===0){
      throw new ApiError(400,"Invalid address id");
    }
    [menuItems]=await db.execute("select r.restaurant_id,restaurant_name,menu_item_id,item_name,cuisine_name,category_name,is_veg,mt.description,price,is_available from menu_items mt join cuisines cu on mt.cuisine_id=cu.cuisine_id join categories ct on mt.category_id=ct.category_id join restaurants r on mt.restaurant_id=r.restaurant_id where r.restaurant_id in (select restaurant_id from restaurants where lower(city)=lower(?))",[rows[0].city]);
  }
  else{
    [menuItems]=await db.execute("select r.restaurant_id,restaurant_name,menu_item_id,item_name,cuisine_name,category_name,is_veg,mt.description,price,is_available from menu_items mt join cuisines cu on mt.cuisine_id=cu.cuisine_id join categories ct on mt.category_id=ct.category_id join restaurants r on mt.restaurant_id=r.restaurant_id where r.restaurant_id in (select restaurant_id from restaurants where lower(city) in (select lower(city) from addresses where user_id=?))",[req.user[0].user_id]);
  }

  if(menuItems.length===0){
    throw new ApiError(400,"No Menu Items found")
  }
  res.status(200).json(new ApiResponse(200,menuItems,"Menu Items Fetched Successfully"));
})

const addReview=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorize request");
  }

  const {restaurant_id,order_id,rating,comment}=req.body;

  if(!restaurant_id || !order_id || !rating){
    throw new ApiError(400,"Missing information");
  }

  const [insertedRows]=await db.execute("insert into reviews (user_id,restaurant_id,order_id,rating,comment) values(?,?,?,?,?) ",[req.user[0].user_id,restaurant_id,order_id,rating,comment.trim()!=="" ? comment.trim() : ""]);


  if(insertedRows.length===0){
    throw new ApiError(500,"Something went wrong");
  }

  res.status(201).json(new ApiResponse(200,{},"Review added successfully"));
})

const getAddresses=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorized request");
  }
  const [data]=await db.execute("select * from addresses where user_id=?",[req.user[0].user_id]);

  res.status(200).json(new ApiResponse(200,data,data.length===0?"No addresses found":"Addresses fetched successfully"));

})

const getMyCarts = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    `SELECT 
      c.cart_id,
      ci.cart_item_id,
      ci.menu_item_id,
      ci.quantity,
      r.restaurant_name,
      mi.item_name,
      mi.price,
      images.image_url
    FROM carts c
    JOIN cart_items ci 
      ON c.cart_id = ci.cart_id
    JOIN restaurants r 
      ON c.restaurant_id = r.restaurant_id
    JOIN menu_items mi 
      ON ci.menu_item_id = mi.menu_item_id
    LEFT JOIN menu_item_images images 
      ON ci.menu_item_id = images.menu_item_id
    WHERE c.user_id = ?`,
    [req.user[0].user_id]
  );

  const groupedCarts = {};

  rows.forEach((row) => {
    if (!groupedCarts[row.cart_id]) {
      groupedCarts[row.cart_id] = {
        cart_id: row.cart_id,
        restaurant_name: row.restaurant_name,
        items: [],
      };
    }

    groupedCarts[row.cart_id].items.push({
      cart_item_id: row.cart_item_id,
      menu_item_id: row.menu_item_id,
      quantity: row.quantity,
      item_name: row.item_name,
      price: Number(row.price),
      image_url: row.image_url,
    });
  });

  const data = Object.values(groupedCarts);

  res
    .status(200)
    .json(new ApiResponse(200, data, "Cart fetched successfully"));
});

const getOrderSummaryForCart=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorized request");
  }
  const {cart_id,delivery_address_id}=req.params;
  const [existingCart] = await db.execute(
    "select * from carts where cart_id=? and user_id=?",
    [cart_id, req.user[0].user_id]
  );

  if (existingCart.length === 0) {
    throw new ApiError(
      400,
      "Cart not found or unauthorized request"
    );
  }

  const [orderItems] = await db.execute(
    `select ci.menu_item_id,
    ci.quantity,
    mi.price,
    mi.item_name
    from cart_items ci
    join menu_items mi
    on ci.menu_item_id=mi.menu_item_id
    where ci.cart_id=?`,
    [cart_id]
  );

  if (orderItems.length === 0) {
    throw new ApiError(400, "No items in cart");
  }

  let itemPrice = 0;

  orderItems.forEach((item) => {
    itemPrice += item.quantity * item.price;
  });
  
  const delivery_fee = await getDeliveryFee(
    delivery_address_id,
    existingCart[0].restaurant_id
  );

  const taxAmount = await getTaxAmount(
    itemPrice + delivery_fee
  );
  
  const totalAmount = itemPrice + delivery_fee + taxAmount;
  const data={
    "ItemPrice":itemPrice,
    "DeliveryFee":delivery_fee,
    "TaxAmount":taxAmount,
    "TotalAmount":totalAmount
  }
  res.status(200).json(new ApiResponse(200,data,"Summary fetched successfully"));

})

const getOrderSummary=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorized request");
  }
  const {menu_item_id,quantity,delivery_address_id}=req.params;
  const [menuItem] = await db.execute(
    "select menu_item_id,item_name,restaurant_id,price from menu_items where menu_item_id=?",
    [menu_item_id]
  );

  if (menuItem.length === 0) {
    throw new ApiError(400, "Menu item not found");
  }
  const itemPrice =Number(quantity) * Number(menuItem[0].price);

  const delivery_fee = await getDeliveryFee(
    delivery_address_id,
    menuItem[0].restaurant_id
  );

  const taxAmount = await getTaxAmount(
    itemPrice + delivery_fee
  );

  const totalAmount =itemPrice + delivery_fee + taxAmount;
  const data={
    "ItemPrice":itemPrice,
    "DeliveryFee":delivery_fee,
    "TaxAmount":taxAmount,
    "TotalAmount":totalAmount
  }
  console.log(data);
  res.status(200).json(new ApiResponse(200,data,"Summary fetched successfully"));
})

const getPaymentMethods=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorized request");
  }

  const [data]=await db.execute("select * from payment_methods");

  res.status(200).json(new ApiResponse(200,data,"Payment methods fetched"));
})

const getRestaurantMenu=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"nauthorized request");
  }

  const {restaurant_id}=req.params;

  const [data]=await db.execute(`SELECT
    mt.*,
    mi.image_url
FROM menu_items mt
LEFT JOIN menu_item_images mi
    ON mt.menu_item_id = mi.menu_item_id
WHERE mt.restaurant_id = ?`,[restaurant_id]);

  if(data.length===0){
    throw new ApiError(400,"No menu items found");
  }
  console.log(data);
  res.status(200).json(new ApiResponse(200,data,"Menu items fetched successfully"));
})

const getNearbyRestaurants = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "customer") {
    throw new ApiError(401, "Unauthorized Request");
  }

  const { latitude, longitude, radius } = req.query;

  // Validation
  if (
    !latitude ||
    !longitude ||
    !radius
  ) {
    throw new ApiError(
      400,
      "Latitude, longitude and radius are required"
    );
  }

  const userLatitude = Number(latitude);
  const userLongitude = Number(longitude);
  const searchRadius = Number(radius);

  if (
    isNaN(userLatitude) ||
    isNaN(userLongitude) ||
    isNaN(searchRadius)
  ) {
    throw new ApiError(
      400,
      "Invalid coordinates or radius"
    );
  }

  // Fetch only restaurants having coordinates
  const [restaurants] = await db.execute(`
    SELECT *
    FROM restaurants
    WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND is_open = 1
  `);

  // Filter restaurants within radius
  const nearbyRestaurants =
    restaurants
      .map((restaurant) => {
        const distance =
          calculateDistance(
            userLatitude,
            userLongitude,
            Number(
              restaurant.latitude
            ),
            Number(
              restaurant.longitude
            )
          );

        return {
          ...restaurant,
          distance_km:
            Number(
              distance.toFixed(2)
            ),
        };
      })
      .filter(
        (restaurant) =>
          restaurant.distance_km <=
          searchRadius
      )
      .sort(
        (a, b) =>
          a.distance_km -
          b.distance_km
      );

  if (
    nearbyRestaurants.length === 0
  ) {
    throw new ApiError(
      400,
      "No nearby restaurants found"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        nearbyRestaurants,
        "Nearby restaurants fetched successfully"
      )
    );
});

const getInitialRestaurants=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="customer"){
    throw new ApiError(401,"Unauthorized request");
  }
  const [data]=await db.execute("select * from restaurants where lower(city) in (select lower(city) from addresses where user_id=?)",[req.user[0].user_id]);

  if(data.length===0){
    throw new ApiError(400,"No restaurants found");
  }
  res.status(200).json(new ApiResponse(200,data,"Restaurants fetched successfully"));
})
export { addAddressDetails, getRestaurantsInMyCity, getMyOrders, getMyPaymentHistory, addItemToCart, placeOrderFromCart, placeOrder, deleteCart, deleteCartItem, updateCartQuantity,getMenuItems,addReview,getAddresses,getMyCarts,getOrderSummaryForCart,getOrderSummary,getPaymentMethods,getRestaurantMenu,getNearbyRestaurants,getInitialRestaurants };
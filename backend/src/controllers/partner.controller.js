import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import calculateDistance from "../utils/getDistance.js";

const togglePartnerAvailability = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "delivery_partner") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    throw new ApiError(400, "is_active must be a boolean");
  }

  await db.execute(
    `UPDATE users
     SET is_active = ?
     WHERE user_id = ?`,
    [is_active, req.user[0].user_id]
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        is_active,
      },
      `You are now ${is_active ? "Online" : "Offline"}`
    )
  );
});

const getDeliveryHistory=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="delivery_partner"){
    throw new ApiError(401,"Unauthorized request");
  }

  const [data]=await db.execute("select da.*,r.restaurant_name,r.address_line as source_add,r.city as source_city,a.address_line as dest_add,a.city as dest_city,o.delivery_partner_payout as earnings from delivery_assignments da join orders o on da.order_id=o.order_id join restaurants r on o.restaurant_id=r.restaurant_id join addresses a on o.delivery_address_id=a.address_id where delivery_partner_id=?",[req.user[0].user_id]);

  if(data.length==0){
    throw new ApiError(400,"No data found");
  }

  res.status(200).json(new ApiResponse(200,data,"History fetched successfully"));
});

const getNewAssignments=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="delivery_partner"){
    throw new ApiError(401,"Unauthorized request");
  }

  const [data]=await db.execute("select o.order_id,r.restaurant_name,r.address_line as source_add,r.city as source_city,a.address_line as dest_add,a.city as dest_city,o.delivery_partner_payout as expected_earnings from orders o  join restaurants r on o.restaurant_id=r.restaurant_id join addresses a on o.delivery_address_id=a.address_id where o.order_status_id=2 and order_id not in (select order_id from delivery_assignments)");

  if(data.length===0){
    throw new ApiError(400,"No orders found");
  }
  
  res.status(200).json(new ApiResponse(200,data,"Nearby orders fetched"));
});

const acceptOrder=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="delivery_partner"){
    throw new ApiError(401,"Unauthorized request");
  }

  const {order_id}=req.body;
  if(!order_id){
    throw new ApiError(400,"Order id required")
  }
  await db.execute(
  "insert into delivery_assignments (order_id, delivery_partner_id, assigned_at, assignment_status) values (?, ?, NOW(), ?)",
  [order_id, req.user[0].user_id, "accepted"]
);

  res.status(201).json(new ApiResponse(201,{},"Order accepted"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "delivery_partner") {
    throw new ApiError(401, "Unauthorized request");
  }

  const { order_id, delivery_status } = req.body;

  if (!order_id || !delivery_status || delivery_status.trim().length === 0) {
    throw new ApiError(400, "Order id and status are required");
  }

  const status = delivery_status.trim();

  if (status !== "picked_up" && status !== "delivered") {
    throw new ApiError(400, "Invalid status");
  }

  // Check assignment
  const [assignment] = await db.execute(
    `SELECT assignment_status
     FROM delivery_assignments
     WHERE order_id = ?
       AND delivery_partner_id = ?`,
    [order_id, req.user[0].user_id]
  );

  if (assignment.length === 0) {
    throw new ApiError(404, "Assignment not found");
  }

  // Prevent invalid transitions
  if (
    status === "picked_up" &&
    assignment[0].assignment_status !== "accepted"
  ) {
    throw new ApiError(400, "Order has already been picked up.");
  }

  if (
    status === "delivered" &&
    assignment[0].assignment_status !== "picked_up"
  ) {
    throw new ApiError(400, "Order must be picked up first.");
  }

  if (status === "picked_up") {
    await db.execute(
      "UPDATE orders SET order_status_id=? WHERE order_id=?",
      [5, order_id]
    );

    await db.execute(
      `UPDATE delivery_assignments
       SET picked_at = NOW(),
           assignment_status = ?
       WHERE order_id = ?
         AND delivery_partner_id = ?`,
      ["picked_up", order_id, req.user[0].user_id]
    );
  } else {
    await db.execute(
      "UPDATE orders SET order_status_id=? WHERE order_id=?",
      [6, order_id]
    );

    await db.execute(
      `UPDATE delivery_assignments
       SET delivered_at = NOW(),
           assignment_status = ?
       WHERE order_id = ?
         AND delivery_partner_id = ?`,
      ["delivered", order_id, req.user[0].user_id]
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Status updated successfully"));
});

const getCurrentOrderDetails = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "delivery_partner") {
    throw new ApiError(401, "Unauthorized request");
  }

  const deliveryPartnerId = req.user[0].user_id;

  const [data] = await db.execute(
    `
    SELECT
      da.assignment_id,

      o.order_id,
      o.total_amount,
      o.payment_method_id,
      o.special_instructions,

      r.restaurant_id,
      r.restaurant_name,
      r.latitude AS restaurant_latitude,
      r.longitude AS restaurant_longitude,

      a.address_id,
      a.address_line,
      a.city,
      a.state,
      a.pincode,
      a.latitude AS customer_latitude,
      a.longitude AS customer_longitude

    FROM delivery_assignments da
    JOIN orders o
      ON da.order_id = o.order_id
    JOIN restaurants r
      ON o.restaurant_id = r.restaurant_id
    JOIN addresses a
      ON o.delivery_address_id = a.address_id

    WHERE da.delivery_partner_id = ?
      AND da.assignment_status IN ('accepted','picked_up')

    LIMIT 1
    `,
    [deliveryPartnerId]
  );

  if (data.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No active delivery"));
  }

  const order = data[0];

  const approxDistance = calculateDistance(
    order.restaurant_latitude,
    order.restaurant_longitude,
    order.customer_latitude,
    order.customer_longitude
  );

  order.approx_distance_km = approxDistance;
  order.full_name=req.user[0].full_name;
  order.phone=req.user[0].phone;
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Current order fetched"));
});

const getDashBoardStats = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "delivery_partner") {
    throw new ApiError(401, "Unauthorized request");
  }

  const partnerId = req.user[0].user_id;

  // Total orders delivered
  const [orderStats] = await db.execute(
    `
    SELECT COUNT(*) AS total_orders_delivered
    FROM delivery_assignments da
    JOIN orders o ON da.order_id = o.order_id
    WHERE da.delivery_partner_id = ?
      AND o.order_status_id = 6
    `,
    [partnerId]
  );

  // Total earnings
  const [earningStats] = await db.execute(
    `
    SELECT COALESCE(SUM(o.delivery_partner_payout),0) AS total_money_earned
    FROM delivery_assignments da
    JOIN orders o ON da.order_id = o.order_id
    WHERE da.delivery_partner_id = ?
      AND o.order_status_id = 6
    `,
    [partnerId]
  );

  // Today's revenue
  const [todayRevenue] = await db.execute(
    `
    SELECT COALESCE(SUM(o.delivery_partner_payout),0) AS today_revenue
    FROM delivery_assignments da
    JOIN orders o ON da.order_id = o.order_id
    WHERE da.delivery_partner_id = ?
      AND o.order_status_id = 6
      AND DATE(da.delivered_at) = CURDATE()
    `,
    [partnerId]
  );

  // Monthly revenue
  const [monthlyRevenue] = await db.execute(
    `
    SELECT COALESCE(SUM(o.delivery_partner_payout),0) AS monthly_revenue
    FROM delivery_assignments da
    JOIN orders o ON da.order_id = o.order_id
    WHERE da.delivery_partner_id = ?
      AND o.order_status_id = 6
      AND MONTH(da.delivered_at) = MONTH(CURDATE())
      AND YEAR(da.delivered_at) = YEAR(CURDATE())
    `,
    [partnerId]
  );

  // Frequently picked restaurants (Top 5)
  const [restaurants] = await db.execute(
    `
    SELECT
      r.restaurant_name,
      COUNT(*) AS total_orders
    FROM delivery_assignments da
    JOIN orders o ON da.order_id = o.order_id
    JOIN restaurants r ON o.restaurant_id = r.restaurant_id
    WHERE da.delivery_partner_id = ?
      AND o.order_status_id = 6
    GROUP BY r.restaurant_id, r.restaurant_name
    ORDER BY total_orders DESC
    LIMIT 5
    `,
    [partnerId]
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalOrdersDelivered:
          orderStats[0].total_orders_delivered,

        totalMoneyEarned:
          Number(earningStats[0].total_money_earned),

        todayRevenue:
          Number(todayRevenue[0].today_revenue),

        monthlyRevenue:
          Number(monthlyRevenue[0].monthly_revenue),

        frequentlyPickedRestaurants: restaurants,
      },
      "Dashboard stats fetched successfully"
    )
  );
});

export {togglePartnerAvailability,getDeliveryHistory,getDashBoardStats,getCurrentOrderDetails,updateOrderStatus,acceptOrder,getNewAssignments}

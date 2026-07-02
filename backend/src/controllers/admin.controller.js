import { db } from "../database/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserCount=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=='admin'){
    throw new ApiError(401,"Unauthorized request");
  }

  const [data]=await db.execute('select r.role_id,role_name,count(user_id) as count from users u join roles r on u.role_id=r.role_id  group by role_id,role_name');

  res.status(200).json(new ApiResponse(200,data,"User count fetched successfully"));
});

const getTotalRestaurants=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=='admin'){
    throw new ApiError(401,"Unauthorized request");
  }

  const [data]=await db.execute('select count(restaurant_id) as count from restaurants');

  res.status(200).json(new ApiResponse(200,data,"Restaurant count fetched successfully"));
})

const getTotalRestaurantRevenue=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=='admin'){
    throw new ApiError(401,"Unauthorized request");
  }

  const [data]=await db.execute('select sum(restaurant_amount) as count from orders');

  res.status(200).json(new ApiResponse(200,data,"Restaurant count fetched"))
})

const getRevenueSummary = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== "admin") {
    throw new ApiError(401, "Unauthorized request");
  }

  const [data] = await db.execute(
    `SELECT
        COALESCE(SUM(total_amount), 0) AS totalRevenue,
        COALESCE(SUM(platform_commission), 0) AS platformRevenue,
        COALESCE(SUM(delivery_partner_payout), 0) AS partnerRevenue,
        COALESCE(SUM(tax_amount), 0) AS totalTax
     FROM orders
     WHERE order_status_id = ?`,
    [6]
  );
  console.log(data);
  return res.status(200).json(
    new ApiResponse(
      200,
      data[0],
      "Revenue summary fetched successfully"
    )
  );
});

const getOrderByStatuses=asyncHandler(async(req,res)=>{
  if (req.user[0].role_name !== "admin") {
    throw new ApiError(401, "Unauthorized request");
  }
  const [data]=await db.execute("select os.order_status_id,status_name,count(order_id) as total_orders from orders o join order_statuses os on  o.order_Status_id=os.order_status_id group by order_Status_id");

  res.status(200).json(new ApiResponse(200,data,"Orders fetched successfully"));
})

const getAllUsers=asyncHandler(async(req,res)=>{
  if (req.user[0].role_name !== "admin") {
    throw new ApiError(401, "Unauthorized request");
  }

  const [data]=await db.execute('select user_id,role_name,email,phone,is_active from users u join roles r on u.role_id=r.role_id');

  res.status(200).json(new ApiResponse(200,data,"Users fetched successfully"));
});

const getAllRestaurants=asyncHandler(async(req,res)=>{
  if (req.user[0].role_name !== "admin") {
    throw new ApiError(401, "Unauthorized request");
  }

  const [data]=await db.execute('select restaurant_id,restaurant_name,address_line,city,state,pincode from restaurants');

  res.status(200).json(new ApiResponse(200,data,"Restaurants fetched successfully"));
});

export {getUserCount,getTotalRestaurantRevenue,getOrderByStatuses,getRevenueSummary,getTotalRestaurants,getAllRestaurants,getAllUsers}
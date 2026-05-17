import { db } from "../database/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";

const addRestaurantDetails = asyncHandler(async (req, res) => {
  const { restaurant_name, description, email, phone } = req.body;
  const details = [restaurant_name, description, email, phone];
  
  details.forEach((detail) => {
    if (!detail || detail.trim() === "") {
      throw new ApiError(400, "All the details are required");
    }
  })
  
  const [existingRestaurant] = await db.execute('select restaurant_name from restaurants where phone=?', [phone]);
  
  if (existingRestaurant.length > 0) {
    throw new ApiError(400, "Restaurant with the same phone no already exists");
  }

  await db.execute('insert into restaurants (owner_id,restaurant_name,email,phone,description) values(?,?,?,?,?) ', [req.user[0].user_id,restaurant_name, email, phone, description])

  const [createdRestaurant] = await db.execute('select restaurant_name,phone,email,description from restaurants where phone=?', [phone]);

  if (createdRestaurant.length === 0) {
    throw new ApiError(400, "Something went wrong while inserting data");
  }

  return res.status(201).json(new ApiResponse(201, createdRestaurant, "Basic Information of restaurant added successfully"));
})

const addLocationDetails = asyncHandler(async (req, res) => {
  const { address_line, city, state, pincode } = req.body;
  const { restaurant_id } = req.params;

  const details = [address_line, city, state, pincode, restaurant_id]
  details.forEach((detail) => {
    if (!detail || detail.trim() === "") {
      throw new ApiError(400, "All the details are required");
    }
  })

  const [result]=await db.execute('update restaurants set address_line=?,city=?,state=?,pincode=? where restaurant_id=? and owner_id=?', [address_line, city, state, pincode, restaurant_id,req.user[0].user_id])

  if (result.affectedRows === 0) {
    throw new ApiError(
      404,
      "Restaurant not found or unauthorized access"
    );
  }

  const [updatedRestaurant] = await db.execute('select address_line,city,state,pincode from restaurants where restaurant_id=?', [restaurant_id]);

  const updatedDetails = [updatedRestaurant[0].address_line, updatedRestaurant[0].city, updatedRestaurant[0].state, updatedRestaurant[0].pincode]

  updatedDetails.forEach((detail) => {
    if (!detail || detail.trim() === "") {
      throw new ApiError(400, "Something went wrong while updating the location");
    }
  })

  return res.status(200).json(new ApiResponse(200,updatedRestaurant,"Address updated successfully"));
})

const addOperationDetails = asyncHandler(async (req, res) => {
  const { restaurant_id } = req.params;
  const { opening_time, closing_time } = req.body;

  if (!opening_time || !closing_time) {
    throw new ApiError(400, "All the details are required");
  }

  const ownerId = req.user[0].user_id;

  const [result] = await db.query(`UPDATE restaurants SET opening_time = ?, closing_time = ?, updated_at = NOW() WHERE restaurant_id = ? AND owner_id = ?`,[opening_time, closing_time, restaurant_id, ownerId]);

  if (result.affectedRows === 0) {
    throw new ApiError( 404, "Restaurant not found or unauthorized access");
  }

  const [updatedRestaurant] = await db.execute('select opening_time,closing_time from restaurants where restaurant_id=?', [restaurant_id]);

  const updatedDetails = [updatedRestaurant[0].opening_time, updatedRestaurant[0].closing_time]

  updatedDetails.forEach((detail) => {
    if (!detail || detail.trim() === "") {
      throw new ApiError(400, "Something went wrong while updating the operating hours");
    }
  })

  return res.status(200).json(new ApiResponse(200,updatedRestaurant,"Operational details added successfully"));
});


const addBrandingDetails = asyncHandler(async (req, res) => {
  let logoLocalPath, bannerLocalPath;

  const { restaurant_id } = req.params;
  const ownerId = req.user[0].user_id;

  if (!req.files || Object.keys(req.files).length === 0) {
    throw new ApiError(400, "At least one image needs to be uploaded");
  }

  // Get file paths
  if (req.files.logo) {
    logoLocalPath = req.files.logo[0].path;
  }

  if (req.files.banner) {
    bannerLocalPath = req.files.banner[0].path;
  }

  // Upload to Cloudinary
  const logoUrl = logoLocalPath ? await uploadOnCloudinary(logoLocalPath):null;

  const bannerUrl = bannerLocalPath ? await uploadOnCloudinary(bannerLocalPath): null;

  // Verify ownership
  const [restaurant] = await db.execute(`SELECT * FROM restaurants WHERE restaurant_id = ? AND owner_id = ?`, [restaurant_id, ownerId]);

  if (restaurant.length === 0) {
    throw new ApiError(404,"Restaurant not found or unauthorized access");
  }
  const [existingBanner]=await db.execute('select * from restaurant_images where restaurant_id=? and image_type=?',[restaurant_id,"banner"])

  if(existingBanner.length>0){
    await db.execute(`update restaurant_images set image_url=? where restaurant_id=?`,[bannerUrl,restaurant_id] );
  }
  else{
    await db.execute(`insert into restaurant_images (restaurant_id,image_url,image_type) values(?,?,?)`,[restaurant_id,bannerUrl,"banner"] );
  }

  const [existingLogo]=await db.execute('select * from restaurant_images where restaurant_id=? and image_type=?',[restaurant_id,"logo"])

  if(existingLogo.length>0){
    await db.execute(`update restaurant_images set image_url=? where restaurant_id=?`,[logoUrl,restaurant_id] );
  }
  else{
    await db.execute(`insert into restaurant_images (restaurant_id,image_url,image_type) values(?,?,?)`,[restaurant_id,logoUrl,"logo"] );
  }
  
  // Get updated restaurant
  const [updatedRestaurant] = await db.execute(`SELECT * FROM restaurant_images WHERE restaurant_id = ?`,[restaurant_id]);

  return res.status(200).json(new ApiResponse(200,updatedRestaurant,"Branding details updated successfully"));
});

const getMyRestaurants=asyncHandler(async(req,res)=>{
  const ownerId=req.user[0].user_id;
  const [rows]=await db.execute('select * from restaurants where owner_id=?',[ownerId]);

  if(rows.length===0){
    throw new ApiError(400,"No restaurants owned by you");
  }
  return res.status(200).json(new ApiResponse(200,rows,"Restaurants fetched successfully"));
})

const getRestaurantImages=asyncHandler(async(req,res)=>{
  const {restaurant_id}=req.params;

  const [rows]=await db.execute('select * from restaurant_images where restaurant_id=?',[restaurant_id]);

  if(rows.length===0){
    throw new ApiError(400,"No images found");
  }

  return res.status(200).json(new ApiResponse(200,rows,"Images fetched successfully"));
})

export {addRestaurantDetails,addLocationDetails,addOperationDetails,addBrandingDetails,getMyRestaurants,getRestaurantImages};
import { db } from "../database/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addRestaurantDetails = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
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

  await db.execute('insert into restaurants (owner_id,restaurant_name,email,phone,description) values(?,?,?,?,?) ', [req.user[0].user_id, restaurant_name, email, phone, description])

  const [createdRestaurant] = await db.execute('select restaurant_name,phone,email,description from restaurants where phone=?', [phone]);

  if (createdRestaurant.length === 0) {
    throw new ApiError(400, "Something went wrong while inserting data");
  }

  return res.status(201).json(new ApiResponse(201, createdRestaurant, "Basic Information of restaurant added successfully"));
})

const addLocationDetails = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
  const { address_line, city, state, pincode,latitude,longitude } = req.body;
  const { restaurant_id } = req.params;

  if(!latitude || !longitude){
    throw new ApiError(400,"Latitude and longitude details are required");
  }
  const details = [address_line, city, state, pincode, restaurant_id,latitude,longitude]
  details.forEach((detail) => {
    if (!detail || typeof detail==="string" && detail.trim() === "") {
      throw new ApiError(400, "All the details are required");
    }
  })

  const [result] = await db.execute('update restaurants set address_line=?,city=?,state=?,pincode=?,latitude=?,longitude=? where restaurant_id=? and owner_id=?', [address_line, city, state, pincode,latitude,longitude, restaurant_id, req.user[0].user_id])

  if (result.affectedRows === 0) {
    throw new ApiError(
      404,
      "Restaurant not found or unauthorized access"
    );
  }

  const [updatedRestaurant] = await db.execute('select address_line,city,state,pincode,latitude,longitude from restaurants where restaurant_id=?', [restaurant_id]);

  const updatedDetails = [updatedRestaurant[0].address_line, updatedRestaurant[0].city, updatedRestaurant[0].state, updatedRestaurant[0].pincode,updatedRestaurant[0].latitude,updatedRestaurant[0].longitude]

  updatedDetails.forEach((detail) => {
    if (!detail || detail.trim() === "") {
      throw new ApiError(400, "Something went wrong while updating the location");
    }
  })

  return res.status(200).json(new ApiResponse(200, updatedRestaurant, "Address updated successfully"));
})

const addOperationDetails = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
  const { restaurant_id } = req.params;
  const { opening_time, closing_time } = req.body;

  if (!opening_time || !closing_time) {
    throw new ApiError(400, "All the details are required");
  }

  const ownerId = req.user[0].user_id;

  const [result] = await db.query(`UPDATE restaurants SET opening_time = ?, closing_time = ?, updated_at = NOW() WHERE restaurant_id = ? AND owner_id = ?`, [opening_time, closing_time, restaurant_id, ownerId]);

  if (result.affectedRows === 0) {
    throw new ApiError(404, "Restaurant not found or unauthorized access");
  }

  const [updatedRestaurant] = await db.execute('select opening_time,closing_time from restaurants where restaurant_id=?', [restaurant_id]);

  const updatedDetails = [updatedRestaurant[0].opening_time, updatedRestaurant[0].closing_time]

  updatedDetails.forEach((detail) => {
    if (!detail || detail.trim() === "") {
      throw new ApiError(400, "Something went wrong while updating the operating hours");
    }
  })

  return res.status(200).json(new ApiResponse(200, updatedRestaurant, "Operational details added successfully"));
});


const addBrandingDetails = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
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
  const logoUrl = logoLocalPath ? await uploadOnCloudinary(logoLocalPath) : null;

  const bannerUrl = bannerLocalPath ? await uploadOnCloudinary(bannerLocalPath) : null;

  // Verify ownership
  const [restaurant] = await db.execute(`SELECT * FROM restaurants WHERE restaurant_id = ? AND owner_id = ?`, [restaurant_id, ownerId]);

  if (restaurant.length === 0) {
    throw new ApiError(404, "Restaurant not found or unauthorized access");
  }
  const [existingBanner] = await db.execute('select * from restaurant_images where restaurant_id=? and image_type=?', [restaurant_id, "banner"])

  if (existingBanner.length > 0) {
    await db.execute(`update restaurant_images set image_url=? where restaurant_id=?`, [bannerUrl, restaurant_id]);
  }
  else {
    await db.execute(`insert into restaurant_images (restaurant_id,image_url,image_type) values(?,?,?)`, [restaurant_id, bannerUrl, "banner"]);
  }

  const [existingLogo] = await db.execute('select * from restaurant_images where restaurant_id=? and image_type=?', [restaurant_id, "logo"])

  if (existingLogo.length > 0) {
    await db.execute(`update restaurant_images set image_url=? where restaurant_id=?`, [logoUrl, restaurant_id]);
  }
  else {
    await db.execute(`insert into restaurant_images (restaurant_id,image_url,image_type) values(?,?,?)`, [restaurant_id, logoUrl, "logo"]);
  }

  // Get updated restaurant
  const [updatedRestaurant] = await db.execute(`SELECT * FROM restaurant_images WHERE restaurant_id = ?`, [restaurant_id]);

  return res.status(200).json(new ApiResponse(200, updatedRestaurant, "Branding details updated successfully"));
});

const getMyRestaurants = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
  const ownerId = req.user[0].user_id;
  const [rows] = await db.execute('select * from restaurants where owner_id=?', [ownerId]);

  if (rows.length === 0) {
    throw new ApiError(400, "No restaurants owned by you");
  }
  return res.status(200).json(new ApiResponse(200, rows, "Restaurants fetched successfully"));
})

const getRestaurantImages = asyncHandler(async (req, res) => {
  
  const { restaurant_id } = req.params;

  const [rows] = await db.execute('select * from restaurant_images where restaurant_id=?', [restaurant_id]);

  if (rows.length === 0) {
    throw new ApiError(400, "No images found");
  }

  return res.status(200).json(new ApiResponse(200, rows, "Images fetched successfully"));
})


const addRestaurantCuisines = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
  const { restaurant_id } = req.params;
  const { cuisine_id } = req.body;

  const [data] = await db.execute('select owner_id from restaurants where restaurant_id=?', [restaurant_id]);
  if (data.length === 0 || data[0].owner_id !== req.user[0].user_id) {
    throw new ApiError(404, "Unauthorized Request");
  }
  const [existingCuisine] = await db.execute('select * from restaurant_cuisines  where restaurant_id=? and cuisine_id=?', [restaurant_id, cuisine_id]);

  if (existingCuisine.length > 0) {
    throw new ApiError(400, "Cuisine already present");
  }
  await db.execute('insert into restaurant_cuisines (restaurant_id,cuisine_id) values(?,?)', [restaurant_id, cuisine_id]);

  const [updatedCuisine] = await db.execute('select * from restaurant_cuisines where restaurant_id=? and cuisine_id=?', [restaurant_id, cuisine_id]);

  if (updatedCuisine.length === 0) {
    throw new ApiError(400, "Something went wrong while insertong Cuisine");
  }
  return res.status(200).json(new ApiResponse(200, updatedCuisine, "Cuisine added successfully"));
})

const addMenuItems = asyncHandler(async (req, res) => {
  if (req.user[0].role_name !== 'owner') {
    throw new ApiError(401, "Unauthorized Request");
  }
  
  const { restaurant_id } = req.params;
  const { category_id, cuisine_id, item_name, description, price, is_veg } = req.body;
  const imageLocalPath=req?.files?.menu_image[0]?.path;

  const [data] = await db.execute('select owner_id from restaurants where restaurant_id=?', [restaurant_id]);
  if (data.length === 0 || data[0].owner_id !== req.user[0].user_id) {
    throw new ApiError(404, "Unauthorized Request");
  }


  const [existingItem] = await db.execute('select * from menu_items where category_id=? and cuisine_id=? and lower(item_name)=lower(?) and lower(description)=lower(?) and price=? and is_veg=? and restaurant_id=?', [category_id, cuisine_id, item_name, description, Number(price), Number(is_veg), restaurant_id]);

  if (existingItem.length > 0) {
    throw new ApiError(400, "Item already exists");
  }

  await db.execute('insert into menu_items (category_id,cuisine_id,item_name,description,price,is_veg,restaurant_id) values(?,?,?,?,?,?,?)', [category_id, cuisine_id, item_name, description, Number(price), Number(is_veg), restaurant_id])

  const [insertedItem] = await db.execute('select * from menu_items where category_id=? and cuisine_id=? and lower(item_name)=lower(?) and lower(description)=lower(?) and price=? and is_veg=? and restaurant_id=?', [category_id, cuisine_id, item_name, description, Number(price), Number(is_veg), restaurant_id]);

  if (insertedItem.length === 0) {
    throw new ApiError(400, "Something went wrong while inserting item");
  }

  const imageUrl=imageLocalPath ? await uploadOnCloudinary(imageLocalPath) : null;

  if(imageUrl){
    await db.execute('insert into menu_item_images (menu_item_id,image_url) values(?,?)',[insertedItem[0].menu_item_id,imageUrl]);
  }

  const [menuImage]=await db.execute('select image_url from menu_item_images where menu_item_id=?',[insertedItem[0].menu_item_id]);

  if(menuImage.length===0 && imageLocalPath){
    throw new ApiError(400,"Something went wrong while inserting image");
  }

  return res.status(201).json(new ApiResponse(201, {insertedItem,menuImage}, "Item inserted successfully"));
})

const getAllCuisines=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!="owner"){
    throw new ApiError(403,"Unauthorized request");
  }

  const [rows]=await db.execute("select * from cuisines");

  if(rows.length===0){
    throw new ApiError(400,"No cuisines found");
  }
  res.status(200).json(new ApiResponse(200,rows,"All cuisines fetched"));
})

const getAllCategories=asyncHandler(async(req,res)=>{
  if(req.user[0].role_name!=="owner"){
    throw new ApiError(403,"Unauthorized request");
  }
  const [rows]=await db.execute("select * from categories");

  if(rows.length===0){
    throw new ApiError(400,"No categories found");
  }

  res.status(200).json(new ApiResponse(200,rows,"Categories fetched successfully"));
})
export { addRestaurantDetails, addLocationDetails, addOperationDetails, addBrandingDetails, getMyRestaurants, getRestaurantImages, addRestaurantCuisines,addMenuItems,getAllCuisines,getAllCategories };
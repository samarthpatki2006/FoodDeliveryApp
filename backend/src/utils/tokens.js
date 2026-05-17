import {db} from "../database/index.js";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const generateAccessToken=async (user)=>{
  return await jwt.sign(
    {
      userId:user.user_id,
      fullName:user.full_name,
      email:user.email
    },
    process.env.ACCESS_TOKEN_EXPIRY,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
const generateRefreshToken=async(user)=>{
  return await jwt.sign(
    {
      userId:user.user_id,
    },
    process.env.REFRESH_TOKEN_EXPIRY,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
const generateAccessAndRefreshTokens = async function (user) {
  //user is on object 
  try {
    if (!user) {
      throw new ApiError(404, "User not found")
    }
    
    const accessToken =await generateAccessToken(user)
    const refreshToken =await generateRefreshToken(user)
   
    await db.execute(
      "UPDATE users SET refresh_token = ? WHERE user_id = ?",
      [refreshToken, user.user_id]
    )
    
    return { accessToken, refreshToken }

  } catch (error) {
    console.error(error)
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    )
  }
}

export {generateAccessAndRefreshTokens};
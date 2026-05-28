import API from "./axios.js";

export const registerUser=(data)=>{
  return API.post("users/register-user",data);
}

export const loginUser=(data)=>{
  return API.post("users/login-user",data);
}

export const getCurrentUser=()=>{
  return API.get("users/get-current-user");
}

export const logoutUser=()=>{
  return API.post("users/logout-user")
}

export const refreshAccessToken=()=>{
  return API.post("users/refresh-access-token")
}
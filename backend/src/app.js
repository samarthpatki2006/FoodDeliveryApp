import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
const app=express();

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(express.json({"limit":"16kb"}))
app.use(express.urlencoded({"extended":true,"limit":"16kb"}))
app.use(express.static("public"))
app.use(cookieparser());
app.use(bodyParser.json());

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)

import ownerRouter from "./routes/owner.routes.js";
app.use("/api/v1/owner",ownerRouter);

import customerRouter from "./routes/customer.routes.js"
app.use("/api/v1/customer",customerRouter);

import adminRouter from "./routes/admin.routes.js"
app.use("/api/v1/admin",adminRouter);

import partnerRouter from "./routes/partner.routes.js"
app.use("/api/v1/partner",partnerRouter);

import  errorHandler from "./middlewares/error.middleware.js";
app.use(errorHandler);

export default app;
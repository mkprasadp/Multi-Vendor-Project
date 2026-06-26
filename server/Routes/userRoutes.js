import express from "express";
import { registeruser, loginUser, getallUser, getUserById, Updateuser } from "../Controller/userController.js";

const userRoutes = express.Router();

userRoutes.post("/register",registeruser);
userRoutes.post("/login",loginUser);
userRoutes.get("/getallusers",getallUser);
userRoutes.get("/:id",getUserById);
userRoutes.put("/updateuser/:id",Updateuser);

export default userRoutes;
import express from 'express';
import UserController from './user.controller.js';
import { upload } from './fileUpload.js';

export const UserRoutes = express.Router();

const userController = new UserController();

UserRoutes.post("/findUser",upload.none(),(req,res,next)=>{
    userController.findUser(req,res,next);
})

UserRoutes.post("/",upload.single('imageUrl'),(req,res,next)=>{
    userController.newUser(req,res,next);
})
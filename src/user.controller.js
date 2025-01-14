import { userConnect,userModel, chatModel } from "../chatSchema.js";

export default class UserController{
    constructor(){

    }

    async newUser(req,res,next){
        try {
            const { username,  room } = req.body;
            // console.log("username:",username);
            const imageUrl = req?.file?.filename;
            // Save the user to the database
            const exist = await userModel.findOne({username});
            console.log("exist",exist);
            if(exist){
               return res.status(201).json( {message:"exist",user:"no user"} );
            }
            const user = new userModel({ username, roomNo:room, imageUrl });
            await user.save();
      
            return res.status(201).json( {message:"new",user} );
        } catch (error) {
            console.error('Error saving user:', error);
            res.status(500).json({ message: 'Error saving user', error });
        }
    }

    async findUser(req,res,next){
        try {
            const { username,  room } = req.body;
            console.log(username,room);
            // Save the user to the database
            const user = await userModel.findOne({ username });
            if(!user){
                return res.status(201).json( {message:"noUser",user:"no user"} );
             }
            res.status(201).json({ message: 'User found', user });
        } catch (error) {
            console.error('Error saving user:', error);
            res.status(500).json({ message: 'Error saving user', error });
        }
    }
}
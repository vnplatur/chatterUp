import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    username: {type:String,required:true}, 
    roomNo: {type:String,required:true}, 
    message: {type:String,required:true}, 
    timeStamp: Date,
});
const userSchema = new mongoose.Schema({
    username: {type:String,required:true}, 
    roomNo: {type:String,required:true},  
    imageUrl: {type:String,required:true}, 
});
const connected = new mongoose.Schema({
    username:{type:String,required:true}, 
    roomNo:{type:String,required:true},
    socketId: { type: String, required: true },
})


export const chatModel = mongoose.model('chat',chatSchema);
export const userModel = mongoose.model('user',userSchema); 
export const userConnect = mongoose.model('online',connected); 
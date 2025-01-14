import mongoose from 'mongoose';

export const connect =async ()=>{
    mongoose.connect('mongodb://localhost:27017/chatterUp',{
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("connected to DB");
} 




import mongoose,{Schema} from 'mongoose';

const userSchema  = new Schema({
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    role : {type: String, enum: ['admin','user','moderator'], default: 'user'},
    skills : [String],
},{timestamps:true});

export default mongoose.model('User',userSchema);
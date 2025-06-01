import mongoose,{Schema} from 'mongoose';

const ticketSchema  = new Schema({
    title : String,
    description : String,
    status : {type: String, default: "TODO", enum: ['TODO', 'IN_PROGRESS', 'DONE']},
    priority : String,
    createdby : {type: Schema.Types.ObjectId, ref: 'User'},
    assignedTo : {type: Schema.Types.ObjectId, ref: 'User',default: null},
    deadline : Date,
    helpfulNotes : String,
    relatedSkills : [String],
},{timestamps:true});

export default mongoose.model('Ticket',ticketSchema);
import {inngest} from '../client.js';
import {NonRetriableError} from 'inngest';
import Ticket from "../../models/user.model.js"
import analyseTicket from '../../utils/ai.js';
import User from '../../models/user.model.js';
import { sendMail } from '../../utils/mailer.js';

export const onTicketCreate = inngest.createFunction(
    {id : "on-ticket-created",retries : 2},
    {event : "ticket/created"},
    async({event,step})=>{
        try {
            const { ticketId} = event.data;

            //getting ticket from database
            const ticket = await step.run("get-ticket",async()=>{
                const ticketObject = await Ticket.findById(ticketId);
                if(!ticketObject){
                    throw new NonRetriableError("ticket is no longer existed in our database")
                }
                return ticketObject;
            })

            //update ticket status to TODO
            await step.run("update-ticket-status",async ()=>{
                await Ticket.findByIdAndUpdate(ticket._id, { status : "TODO" });
            })

            //get ai reponse and update fields
            const aiResponse = await analyseTicket(ticket);

            const relatedSkills = await step.run("ai-processing",async()=>{
                let skills = [];
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        priority : !["low","medium","high"].includes(aiResponse.priority) ? "medium" :aiResponse.priority,
                        helpfulNotes : aiResponse.helpfulNotes,
                        status : "IN_PROGRESS",
                        relatedSkills : aiResponse.relatedSkills,
                    })
                    skills = aiResponse.relatedSkills;
                }
                return skills;
            })

            // find a moderator and assign acc. to skills
            const moderator = await step.run("assign-moderator",async () =>{
                let user = await User.findOne({
                    role : "moderator",
                    skills : {
                        $elemMatch : {
                            $regex : relatedSkills.join("|"),
                            $options : "i",
                        },
                    },
                });
                if(!user){
                    user = await User.findOne({role : "admin"});
                }
                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo : user?._id || null,
                })
                return user;
            })

            //send email to moderator regarding ticket
            await step.run("send-email-to-moderator",async ()=>{
                if(moderator){
                    const finalTicket = await Ticket.findById(ticket._id);
                    await sendMail(
                        moderator.email,
                        "Ticket Assigned",
                        `A new ticket has been assigned to you ${finalTicket.title}`
                    )
                }
            });

            return {success : true};
            
        } catch (error) {
            console.error("error during step", error.message);
            return {success : false};
            
        }
    }
);
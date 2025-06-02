import Ticket from '../models/ticket.model.js';
import {inngest} from "../inngest/client.js"

export const createTicket  = async (req,res)=>{
    try {
        const {title,description} = req.body;
        if(!title || !description){
            return res.status(400).json({message: "Title and description are required"});
        }
        const newTicket = await Ticket.create({
            title,description,
            createdby : req.user._id.toString(),
        });

        // trigger the ticket created event
        await inngest.send({
            event : "ticket/created",
            data :{
                ticketId : newTicket._id.toString(),
                title,
                description,
                createdby : req.user._id.toString(),
            }
        })
        return res.status(201).json({
            message: "Ticket created and processing started",
            ticket: newTicket,
        });
    } catch (error) {
        console.error("Error creating ticket", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getTickets = async (req,res)=>{
    try {
        const user = req.user;
        let tickets = [];
        if(user.role !== "user"){
            tickets = await Ticket.find().populate("assignedTo",["email","_id"]).sort({createdAt : -1})
        }else{
            tickets = await Ticket.find({createdby : user._id}).select("title description status createdAt").sort({createdAt : -1});
        }
        return res.status(200).json({
            message: "Tickets fetched successfully",
            tickets,
        });
    } catch (err) {
        console.log("Error fetching tickets",err.message);
        return res.status(500).json({message: "Internal Server Error"});
        
    }
};

export const getTicket = async (req,res)=>{
    try {
        const user = req.user;
        let ticket;
        if(user.role !== "user"){
            ticket = await Ticket.findById(req.params.id).populate("assignedTo",["email","_id"]);
        }else{
            ticket = await Ticket.findOne({
                createdby : user._id,
                _id : req.params.id,
            }).select("title description status createdAt");
        }
        if(!ticket){
            return res.status(404).json({message: "Ticket not found"});
        }
        return res.status(200).json({
            message: "Ticket fetched successfully",
            ticket,
        });
    } catch (err) {
        console.log("Error fetching ticket", err.message);
        return res.status(500).json({message: "Internal Server Error"});    
    }
};
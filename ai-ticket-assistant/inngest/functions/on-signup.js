import {inngest, NonRetriableError} from 'inngest';
import User from "../../models/user.model.js"
import { sendMail } from '../../utils/mailer';

export const onUserSignup = inngest.createFunction(
    {id : "on-user-signup",retries : 2},
    {event : "user/signup"},
    async ({event,step})=>{
        try {
            const { email} = event.data;
           const user =  await step.run("get-user-email", async ()=>{
                const userObject = await User.findOne({email});
                if(!userObject){
                    throw new NonRetriableError("user is no longer existed in our database")
                }
                return userObject
            })

            await step.run("send-welcome-email",async ()=>{
                subject : `welcome to our app`
                message : `Hi,
                \n\n
                Thanks for signing up.We are glad to have you onboard`
                await sendMail(user.email,subject,message);
            })

            return {success : true}

        } catch (error) {
            console.error("error during step",error.message)
            return {success :  false}
        }
    }
)
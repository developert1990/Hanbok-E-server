import nodemailer from 'nodemailer';
import express, { Request, Response } from 'express';

const emailRouter = express.Router();

emailRouter.post('/', (req: Request, res: Response) => {
    console.log("이메일 라우터 들어옴");
    console.log('req.body', req.body);

    const message = `Name: ${req.body.name} ,\n${req.body.message}`

    // Step 1
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    // Step 2
    const mailOptions = {
        from: req.body.email,
        to: 'sangmean.test@gmail.com',
        subject: `From - ${req.body.email}`,
        text: message
    }

    // Step 3

    transporter.sendMail(mailOptions, (err, data) => {

        if (err) {
            res.send({ msg: 'There is an error to Send Message', success: false, loading: false });
        } else {
            res.send({ msg: 'Your Message sent successfully', success: true, loading: false });
            console.log("Email sent");
        }
    });
})

export default emailRouter;
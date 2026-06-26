import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "manikantaprasad1618@gmail.com",
    pass: "mslephkintmlvjua", 
    //cvum tlsl jhqc tqnx
  },
});

export default transporter;

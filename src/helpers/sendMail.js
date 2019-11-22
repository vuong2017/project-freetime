import nodemailer from "nodemailer";

export const sendMail = ({transporter, mailOptions}) => {
    return new Promise((resolve, rejects) => {
        const mail = nodemailer.createTransport(transporter);
        mail.sendMail(mailOptions, function (error, info) {
            if (error) {
                rejects(error)
            } else {
                resolve(info)
            }
        });
    })
}
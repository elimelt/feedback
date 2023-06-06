import sgMail from '@sendgrid/mail'
import config from './config'

export async function forward(name: string, email: string, feedback: string, secret: string) {
    if (config.SECRET !== secret) return;

    sgMail.setApiKey(config.SENDGRID_API_KEY)
    const msg = {
        to: config.MY_EMAIL,
        from: config.MY_SENDER,
        subject: `feedback from ${name}  |  ${email}`,
        text: feedback,
        html: '<strong>' + feedback + '</strong>'
    }

    try {
        const result = await sgMail.send(msg)
        console.log("sendGrid result: ", result)
    } catch (error) {
        console.error(error)
    }
}





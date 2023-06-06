import sgMail from '@sendgrid/mail'
import config from './config'

export async function forward(name: string, email: string, feedback: string, secret: string) {
    console.log("secrets: ", config.SECRET, secret);
    console.log("bool: config.SECRET !== secret", config.SECRET !== secret)

    if (""+config.SECRET !== ""+secret) return { success: false };

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
        return { success: ("" + result[0].statusCode === "" + 202) }
    } catch (error) {
        console.error(error)
        return { success: false }
    }
}





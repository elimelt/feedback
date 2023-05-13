require('dotenv').config();


const MY_EMAIL = process.env.MY_EMAIL as string;
const MY_SENDER = process.env.MY_SENDER as string;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
const SERVER_URL = process.env.SERVER_URL as string;
const SECRET = process.env.SECRET as string;

const config = { MY_EMAIL, MY_SENDER, SENDGRID_API_KEY, SERVER_URL, SECRET }


export default config;
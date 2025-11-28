import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
    APP_NAME: process.env.APP_NAME,
    BACKEND_URL: process.env.BACKEND_URL,
    PORT: process.env.PORT || 3500,

    ARI_URL: process.env.ARI_URL,
    ARI_USER: process.env.ARI_USER,
    ARI_PASS: process.env.ARI_PASS,
}

export default CONFIG;
import express from 'express';
import cors from 'cors';
import CONFIG from '#config/config.js';
import router from '#routes/index.js';
import cookieParser from 'cookie-parser';
import http from 'http';
import { initSocket } from '#utils/socketService.js';
import { connectAri } from './ariClient.js';

const app = express(); 
const server = http.createServer(app);
export const dispatch = initSocket(server); 

app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);

(async () => {
    try {
        await connectAri(dispatch);
    } catch (error) {
        console.log("Error ARI:", error)
    }
})();

server.listen(CONFIG.PORT, () => {
    console.log(`Server running on http://localhost:${CONFIG.PORT}`);
});
import jwt from 'jsonwebtoken';

export const initializeSocketIO = (io) => {
    io.on('connection', (socket) => {
        socket.on('register', (token) => {
            if (!token) return;
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.join(decoded.id);
                console.log(`[WebSocket Server] User ${decoded.id} successfully joined their socket room.`);
            } catch (error) {
                console.log('[WebSocket Server] Socket registration failed: Invalid token'); 
            }
        });
    });
};
import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {

    if(io) return io;

    io = new Server(server, {
        cors: {
            origin: '*',
        }    
    });

    io.on("connection", (socket) => {
        console.log("Usuario conectado:", socket.id);

        socket.on("join", (room) => {
            socket.join(room);
            console.log(`${socket.id} se unió a ${room}`);
        });

        socket.on("leave", (room) => {
            socket.leave(room);
            console.log(`${socket.id} salió de ${room}`);
        });

        socket.on("mensaje", ({ room, msg }) => {
            io.to(room).emit("mensaje", msg);
            socket.to(room).emit("mensaje-sound");
        });

        socket.on("disconnect", () => {
            console.log("Usuario desconectado:", socket.id);
        });
    });

    return io;
}
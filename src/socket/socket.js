import { io } from "socket.io-client";

// const socket = io("https://meexapp-backend.onrender.com", {
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
});

export default socket;

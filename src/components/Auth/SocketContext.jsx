// components/Auth/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import socket from "../../socket/socket";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    socket.on("call-made", ({ from, offer }) => {
      setIncomingCall({ from, offer });
    });

    return () => {
      socket.off("call-made");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);

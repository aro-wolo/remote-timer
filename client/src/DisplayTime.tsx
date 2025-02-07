import React, { useState, useEffect } from 'react';

const DisplayTime: React.FC = () => {
    const [time, setTime] = useState<number>(0);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        socket.onmessage = async (event) => {
            if (socket.readyState === WebSocket.OPEN) {
                let messageData = event.data;
                if (messageData instanceof Blob) {
                    messageData = await messageData.text();
                }
                const message = JSON.parse(messageData);
                if (message.type === 'updateTime') {
                    const currentTime = message.time
                    const lastUpdate = Date.now();
                    localStorage.setItem('time', JSON.stringify({ currentTime, lastUpdate }));
                    setTime(currentTime);
                }
            }
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }, []);

    useEffect(() => {
        const storedTime = localStorage.getItem('time');
        if (storedTime) {
            const { currentTime, lastUpdate } = JSON.parse(storedTime);
            const elapsedTime = Math.floor((Date.now() - lastUpdate) / 1000);
            setTime(Math.max(currentTime - elapsedTime, 0));
        }
    }, []);

    useEffect(() => {
        if (time > 0) {
            const timer = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    localStorage.setItem('time', JSON.stringify({ currentTime: newTime, lastUpdate: Date.now() }));
                    return newTime;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [time]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return (
            <>
                {mins}<span className={getBlinkClass(seconds)}>:</span>{secs}
            </>
        );
    };

    const getTimeColor = (seconds: number) => {
        if (seconds < 180) {
            return 'bright-red';
        } else if (seconds < 600) {
            return 'bright-green';
        } else {
            return 'bright-white';
        }
    };

    const getBlinkClass = (seconds: number) => {
        return seconds < 30 ? 'blink' : '';
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className={`text-center time-display ${getTimeColor(time)} `}>
                {time > 0 ? formatTime(time) : <span >Time Up</span>}
            </div>
        </div>
    );
};

export default DisplayTime;

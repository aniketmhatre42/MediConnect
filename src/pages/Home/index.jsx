import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';

const HomePage = () => {
  const [roomNo, setRoomNo] = useState("");
  const navigate = useNavigate();

  const sendVerificationEmail = async (roomID) => {
    if (!roomID) {
      console.error("Room ID is missing");
      return;
    }

    const roomLink = `${window.location.origin}/room/${roomID}`;

    const templateParams = {
      to_name: "Aniket Mhatre",
      message: `Click the link to join the room: ${roomLink}`,
      to_email: "aniketam22hcompe@student.mes.ac.in",
    };

    try {
      await emailjs.send(
        'service_1t8q59l',
        'template_hvwidsi',
        templateParams,
        '1IfAne03Jp4tj9rNj'
      );
      console.log("Email sent successfully!");
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  const handleJoinRoom = useCallback(() => {
    const roomID = roomNo.trim();
    if (roomID) {
      localStorage.setItem('roomID', roomID); // Store the room ID
      sendVerificationEmail(roomID); // Send the email with the correct room link
      navigate(`/room/${roomID}`);
    } else {
      alert("Please enter a valid Room ID.");
    }
  }, [navigate, roomNo]);

  return (
    <div style={styles.wrapper}>
      <img
        src="https://media.istockphoto.com/id/1263326624/vector/video-conferencing-at-home-close-up-african-young-woman-having-video-call-meeting-with.jpg?s=612x612&w=0&k=20&c=bgggESPzhZdCPe42a-AbJWApDetOrQ9ZD7hT4WbZlFo="
        alt="Room Illustration"
        style={styles.image}
      />
      <div style={styles.container}>
        <span style={styles.text}>Enter Room ID to join</span>
        <div style={styles.inputGroup}>
          <input
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            type="text"
            placeholder="Enter Room Code"
            style={styles.input}
          />
          <button onClick={handleJoinRoom} style={styles.button}>
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    textAlign: "center",
  },
  image: {
    width: "500px",
    marginBottom: "50px",
  },
  container: {
    backgroundColor: "#f8f9fa",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    margin: "0 auto",
  },
  text: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#333",
    marginBottom: "10px",
  },
  inputGroup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    padding: "10px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "all 0.3s ease",
  },
};

export default HomePage;

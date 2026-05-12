import { useState } from "react";
import { useNavigate,  Link, useLocation } from "react-router";
import apiprivate from "../../services/api";

function ChatDashboard() {
     const navigate = useNavigate();
 // const location = useLocation() ;
    const [formData, setFormData] = useState({
    message: "",
  });

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!formData.message) {
            return;
        }
        try {
         
            await apiprivate.post("/messages", { text: formData.message });
            setFormData({ message: "" });
        } catch (err) {
            console.error("Error sending message:", err);
       
            }
        }


    return (
        <div>
            <h1>Chat Dashboard</h1>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );

    };
export default ChatDashboard;

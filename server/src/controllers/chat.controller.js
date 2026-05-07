
export const createChat = (req, res) => {
    try {
        const { chatId, participants } = req.body;
        if (!chatId || !participants || participants.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID and at least 2 participants are required',
            });
        }
        // Here you would typically save the chat to the database
        res.status(201).json({
            success: true,
            chat: { chatId, participants },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message,
        });
    }
};
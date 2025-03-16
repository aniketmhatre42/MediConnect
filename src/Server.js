const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001; // Port for the backend server

// Middleware to handle JSON
app.use(express.json());

// API route to interact with OpenAI
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // or the model you are using
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userMessage },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const assistantReply = response.data.choices[0].message.content;
    res.json({ reply: assistantReply });
  } catch (error) {
    res.status(500).send('Error interacting with OpenAI API');
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

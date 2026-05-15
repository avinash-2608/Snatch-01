const fetchImpl = typeof fetch !== 'undefined' ? fetch : global.fetch;

exports.handleChat = async (req, res) => {
  try {
    console.log('AI Chat request received');
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY in environment variables');
      return res.status(500).json({ reply: "I'm sorry, my systems are currently offline. Please contact the administrator." });
    }
    // Call Gemini API automatically with the standard supported 2.5 flash logic
    const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ reply: "I encountered an error while processing your request. Please try again later." });
    }

    // Extract the text content from the Gemini response structure
    let reply = "I couldn't generate a response.";
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
      reply = data.candidates[0].content.parts[0].text;
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: 'Sorry, my server ran into an internal issue.' });
  }
};

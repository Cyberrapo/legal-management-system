const chat = async (req, res) => {
  try {
    const { message } = req.body

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API key not configured' })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful legal assistant for lawyers and advocates in India. Answer legal questions clearly and professionally. Always remind users to consult a licensed attorney for specific legal advice.'
          },
          {
            role: 'user',
            content: message
          }
        ],
      }),
    })

    const data = await response.json()
    console.log('Groq response status:', response.status)

    if (data.error) {
      console.error('Groq error:', data.error)
      return res.status(500).json({ message: data.error.message })
    }

    res.json({ reply: data.choices[0].message.content })

  } catch (err) {
    console.error('Chat error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { chat }
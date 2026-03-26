const chat = async (req, res) => {
  try {
    const { message } = req.body
    if (!process.env.GROQ_API_KEY)
      return res.status(500).json({ message: 'Groq API key not configured' })

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
          { role: 'user', content: message }
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return res.status(500).json({ message: data.error.message })
    res.json({ reply: data.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const generateDocument = async (req, res) => {
  try {
    const { templateType, fields } = req.body
    if (!process.env.GROQ_API_KEY)
      return res.status(500).json({ message: 'Groq API key not configured' })

    const prompt = `You are a professional legal document drafter in India.
Generate a complete, formal ${templateType} using the following details:

${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}

Requirements:
- Use formal legal language appropriate for Indian courts
- Include all standard sections for this document type
- Format it professionally with proper headings
- Make it ready to use with minimal editing
- Include standard legal disclaimers where appropriate
- Use Indian legal terminology and references

Generate the complete document now:`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 2048,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    })

    const data = await response.json()
    if (data.error) return res.status(500).json({ message: data.error.message })
    res.json({ document: data.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { chat, generateDocument }
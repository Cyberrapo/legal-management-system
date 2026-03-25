import { useState } from 'react'
import API from '../api/axios'
import styles from './Chatbot.module.css'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI legal assistant. Ask me any legal question.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await API.post('/chat', { message: input })
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>AI Legal Assistant</h2>
      <div className={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? styles.userMsg : styles.botMsg}>
            <span>{m.text}</span>
          </div>
        ))}
        {loading && <div className={styles.botMsg}><span>Thinking...</span></div>}
      </div>
      <form className={styles.inputArea} onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a legal question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  )
}
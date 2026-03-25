import { useState, useRef, useEffect } from 'react'
import API from '../api/axios'
import styles from './Chatbot.module.css'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI legal assistant. Ask me any legal question and I will help you with clear, professional answers.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
      <div className={styles.header}>
        <h2 className={styles.title}>AI Legal Assistant</h2>
        <p className={styles.subtitle}>Powered by Groq AI — Ask any legal question</p>
      </div>

      <div className={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.messageUser : ''}`}>
            <div className={`${styles.messageAvatar} ${m.role === 'user' ? styles.avatarUser : styles.avatarBot}`}>
              {m.role === 'user' ? '👤' : '⚖️'}
            </div>
            <div className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleBot}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className={styles.message}>
            <div className={`${styles.messageAvatar} ${styles.avatarBot}`}>⚖️</div>
            <div className={`${styles.bubble} ${styles.bubbleBot}`}>
              <div className={styles.typing}>
                <div className={styles.dot}/>
                <div className={styles.dot}/>
                <div className={styles.dot}/>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className={styles.inputArea} onSubmit={sendMessage}>
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask a legal question e.g. What is bail in Indian law?"
          disabled={loading} />
        <button type="submit" className={styles.sendBtn} disabled={loading}>
          {loading ? '...' : '➤ Send'}
        </button>
      </form>
    </div>
  )
}
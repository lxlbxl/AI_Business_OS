import { useState, useRef, useEffect } from 'react'
import { api } from '../utils/api'
import ReactMarkdown from 'react-markdown'
import { Send, Sparkles, User, AlertCircle } from 'lucide-react'
import './ChatPanel.css'

export default function ChatPanel() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `👋 Hello! I'm your AI-COO, ready to help you run operations.

I operate within defined authority levels:
- 🟢 **Autonomous**: Research, drafts, organization
- 🟡 **Notify**: Priority changes, icebox moves  
- 🟠 **Approval**: External comms, finances, strategy
- 🔴 **Never**: Payments, contracts, credentials

**Try asking me:**
- "What's our current bottleneck?"
- "Run the daily start routine"
- "Create 5 content hooks for Digital20"
- "What's in the knowledge bank about offers?"

How can I help you today?`
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setError(null)

        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }))
            const response = await api.sendMessage(userMessage, history)

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.message
            }])
        } catch (err) {
            setError(err.message)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Error: ${err.message}\n\nPlease check that the ANTHROPIC_API_KEY is configured in the backend.`,
                isError: true
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="chat-panel card">
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.role} ${message.isError ? 'error' : ''}`}
                    >
                        <div className="message-avatar">
                            {message.role === 'assistant' ? (
                                <Sparkles size={16} />
                            ) : (
                                <User size={16} />
                            )}
                        </div>
                        <div className="message-content">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="chat-message assistant loading">
                        <div className="message-avatar">
                            <Sparkles size={16} />
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-input input"
                    placeholder="Ask your AI-COO anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn btn-primary chat-send-btn"
                    disabled={!input.trim() || loading}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}

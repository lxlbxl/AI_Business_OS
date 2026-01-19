import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/ChatPanel'
import FileBrowser from '../components/FileBrowser'
import WorkflowBar from '../components/WorkflowBar'
import ApprovalsPanel from '../components/ApprovalsPanel'
import {
    MessageSquare,
    FolderOpen,
    CheckCircle,
    Sparkles,
    Sun,
    Moon,
    Coffee
} from 'lucide-react'
import './Dashboard.css'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return { text: 'Good morning', icon: Coffee }
    if (hour < 18) return { text: 'Good afternoon', icon: Sun }
    return { text: 'Good evening', icon: Moon }
}

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [activePanel, setActivePanel] = useState('chat')
    const [workflows, setWorkflows] = useState([])
    const [approvals, setApprovals] = useState([])
    const [status, setStatus] = useState(null)

    const greeting = getGreeting()
    const GreetingIcon = greeting.icon

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [workflowData, approvalData, statusData] = await Promise.all([
                api.getWorkflows(),
                api.getApprovals(),
                api.getStatus()
            ])
            setWorkflows(workflowData)
            setApprovals(approvalData)
            setStatus(statusData)
        } catch (error) {
            console.error('Failed to load data:', error)
        }
    }

    const refreshApprovals = async () => {
        const data = await api.getApprovals()
        setApprovals(data)
    }

    return (
        <div className="dashboard">
            <Sidebar
                user={user}
                logout={logout}
                activePanel={activePanel}
                setActivePanel={setActivePanel}
                approvalsCount={approvals.length}
            />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-greeting">
                        <GreetingIcon size={24} className="greeting-icon" />
                        <div>
                            <h1>{greeting.text}, {user?.name || 'there'}</h1>
                            <p>Your AI-COO is ready to assist.</p>
                        </div>
                    </div>

                    <div className="header-status">
                        {status?.aiConfigured ? (
                            <div className="status-badge status-online">
                                <Sparkles size={14} />
                                <span>AI Online</span>
                            </div>
                        ) : (
                            <div className="status-badge status-offline">
                                <span>AI Offline - Configure API Key</span>
                            </div>
                        )}
                    </div>
                </header>

                <WorkflowBar
                    workflows={workflows}
                    onWorkflowComplete={loadData}
                />

                <div className="dashboard-content">
                    {activePanel === 'chat' && (
                        <ChatPanel />
                    )}

                    {activePanel === 'files' && (
                        <FileBrowser />
                    )}

                    {activePanel === 'approvals' && (
                        <ApprovalsPanel
                            approvals={approvals}
                            onUpdate={refreshApprovals}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

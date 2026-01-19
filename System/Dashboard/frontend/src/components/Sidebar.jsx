import {
    MessageSquare,
    FolderOpen,
    CheckCircle,
    LogOut,
    Sparkles,
    Target,
    BookOpen,
    Settings
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'AI Assistant' },
    { id: 'files', icon: FolderOpen, label: 'File Browser' },
    { id: 'approvals', icon: CheckCircle, label: 'Approvals' },
]

export default function Sidebar({ user, logout, activePanel, setActivePanel, approvalsCount }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <Sparkles size={20} />
                    </div>
                    <div className="logo-text">
                        <span className="logo-title">AI Business OS</span>
                        <span className="logo-subtitle">Command Center</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">Main</span>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
                            onClick={() => setActivePanel(item.id)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {item.id === 'approvals' && approvalsCount > 0 && (
                                <span className="nav-badge">{approvalsCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="nav-section">
                    <span className="nav-section-title">Quick Access</span>
                    <a href="#strategy" className="nav-item nav-link">
                        <Target size={18} />
                        <span>Strategy</span>
                    </a>
                    <a href="#knowledge" className="nav-item nav-link">
                        <BookOpen size={18} />
                        <span>Knowledge Bank</span>
                    </a>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{user?.role?.toUpperCase() || 'CEO'}</span>
                    </div>
                </div>
                <button className="btn btn-ghost logout-btn" onClick={logout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

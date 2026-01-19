import { useState } from 'react'
import { api } from '../utils/api'
import ReactMarkdown from 'react-markdown'
import {
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import './ApprovalsPanel.css'

export default function ApprovalsPanel({ approvals, onUpdate }) {
    const [expanded, setExpanded] = useState({})
    const [processing, setProcessing] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(null)

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleApprove = async (approval) => {
        if (!confirm('Are you sure you want to approve this request?')) return

        setProcessing(approval.id)
        try {
            await api.approveRequest(approval.id, 'Approved via dashboard')
            onUpdate?.()
        } catch (error) {
            alert('Failed to approve: ' + error.message)
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async () => {
        if (!showRejectModal) return

        setProcessing(showRejectModal)
        try {
            await api.rejectRequest(showRejectModal, rejectReason || 'No reason provided')
            setShowRejectModal(null)
            setRejectReason('')
            onUpdate?.()
        } catch (error) {
            alert('Failed to reject: ' + error.message)
        } finally {
            setProcessing(null)
        }
    }

    if (approvals.length === 0) {
        return (
            <div className="approvals-panel card">
                <div className="approvals-empty">
                    <CheckCircle size={48} className="empty-icon" />
                    <h3>No Pending Approvals</h3>
                    <p>All caught up! Your AI-COO is operating within approved limits.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="approvals-panel">
            <div className="approvals-header">
                <AlertTriangle size={20} className="header-icon" />
                <h2>{approvals.length} Pending Approval{approvals.length > 1 ? 's' : ''}</h2>
            </div>

            <div className="approvals-list">
                {approvals.map((approval) => (
                    <div key={approval.id} className="approval-card card">
                        <div
                            className="approval-header"
                            onClick={() => toggleExpand(approval.id)}
                        >
                            <div className="approval-info">
                                <Clock size={16} className="approval-icon" />
                                <span className="approval-id">{approval.id}</span>
                                <span className="approval-date">
                                    {new Date(approval.created).toLocaleDateString()}
                                </span>
                            </div>
                            <button className="expand-btn">
                                {expanded[approval.id] ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </button>
                        </div>

                        {expanded[approval.id] && (
                            <div className="approval-content">
                                <div className="approval-body">
                                    <ReactMarkdown>{approval.content}</ReactMarkdown>
                                </div>

                                <div className="approval-actions">
                                    <button
                                        className="btn btn-sage"
                                        onClick={() => handleApprove(approval)}
                                        disabled={processing === approval.id}
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowRejectModal(approval.id)}
                                        disabled={processing === approval.id}
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h3>Reject Request</h3>
                        <p>Please provide a reason for rejection:</p>
                        <textarea
                            className="input"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                        />
                        <div className="modal-actions">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowRejectModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReject}
                                disabled={processing}
                                style={{ background: 'var(--status-error)' }}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

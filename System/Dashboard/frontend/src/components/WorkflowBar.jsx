import { useState } from 'react'
import { api } from '../utils/api'
import { Play, Loader } from 'lucide-react'
import './WorkflowBar.css'

const workflowIcons = {
    'daily-start': '🌅',
    'brain-dump': '🧠',
    'weekly-review': '📊',
    'prioritize': '🎯',
    'librarian': '📚',
    'content': '✍️',
    'coo': '🤖'
}

export default function WorkflowBar({ workflows, onWorkflowComplete }) {
    const [running, setRunning] = useState(null)
    const [result, setResult] = useState(null)

    const handleRun = async (workflow) => {
        setRunning(workflow.id)
        setResult(null)

        try {
            const data = await api.runWorkflow(workflow.id)
            setResult({
                workflow: workflow.name,
                content: data.result,
                success: true
            })
            onWorkflowComplete?.()
        } catch (error) {
            setResult({
                workflow: workflow.name,
                content: error.message,
                success: false
            })
        } finally {
            setRunning(null)
        }
    }

    return (
        <div className="workflow-section">
            <div className="workflow-bar">
                <span className="workflow-bar-label">Quick Actions:</span>
                <div className="workflow-buttons">
                    {workflows.map((workflow) => (
                        <button
                            key={workflow.id}
                            className="workflow-btn"
                            onClick={() => handleRun(workflow)}
                            disabled={running !== null}
                            title={workflow.description}
                        >
                            {running === workflow.id ? (
                                <Loader size={14} className="workflow-spinner" />
                            ) : (
                                <span className="workflow-icon">
                                    {workflowIcons[workflow.id] || '⚡'}
                                </span>
                            )}
                            <span className="workflow-name">{workflow.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {result && (
                <div className={`workflow-result card ${result.success ? '' : 'error'}`}>
                    <div className="workflow-result-header">
                        <span className="workflow-result-title">
                            {result.success ? '✅' : '❌'} {result.workflow} Result
                        </span>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setResult(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                    <div className="workflow-result-content">
                        <pre>{result.content}</pre>
                    </div>
                </div>
            )}
        </div>
    )
}

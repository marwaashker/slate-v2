"use client"

function DailyBriefing({ todayTasks, setBriefOpen, briefOpen, briefing, loading, error }) {

    return (
        <div className="briefing-card">
            <div className="briefing-header">
                <span className="briefing-icon">✦</span>
                <span className="briefing-title">Morning briefing</span>
                <button
                    className="briefing-dismiss"
                    onClick={() => { setBriefOpen(!briefOpen) }}
                    aria-label="Dismiss briefing"
                >
                    ×
                </button>
            </div>

            <div className="briefing-body">
                {loading && (
                    <div className="briefing-loading">
                        <span className="briefing-dot" />
                        <span className="briefing-dot" />
                        <span className="briefing-dot" />
                    </div>
                )}
                {error && <p className="briefing-error">{error}</p>}
                {!loading && !error && briefOpen && briefing && (
                    <p className="briefing-text">{briefing}</p>
                )}
            </div>
        </div>
    )
}

export default DailyBriefing
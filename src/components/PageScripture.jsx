import React from 'react';

const PageScripture = ({ verse, reference }) => {
    return (
        <div className="animate-fadeIn" style={{
            textAlign: 'center',
            padding: 'var(--space-md) var(--space-lg)',
            marginBottom: 'var(--space-xl)',
            background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.05), transparent)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            margin: '-var(--space-lg) -var(--space-lg) var(--space-lg) -var(--space-lg)', 
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }}>
            <p style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                fontSize: '1.15rem',
                margin: '0 0 8px 0',
                lineHeight: 1.6
            }}>
                "{verse}"
            </p>
            <p style={{
                color: 'var(--gold-600)',
                fontWeight: 600,
                fontSize: '0.9rem',
                margin: 0,
                letterSpacing: '0.05em'
            }}>
                — {reference}
            </p>
        </div>
    );
};

export default PageScripture;

const clerkAppearance = {
    variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#0f172a',
        colorInputBackground: 'rgba(255,255,255,0.05)',
        colorInputText: '#f1f5f9',
        colorText: '#f1f5f9',
        colorTextSecondary: '#94a3b8',
        colorNeutral: '#475569',
        borderRadius: '10px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: '15px',
    },
    elements: {
        rootBox: {
            width: '100%',
            maxWidth: '420px',
        },
        card: {
            background: 'rgba(15, 23, 42, 0.0)',
            boxShadow: 'none',
            border: 'none',
            padding: '0',
        },
        header: {
            display: 'none',
        },
        socialButtonsBlockButton: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '10px',
            fontWeight: '600',
            transition: 'all 0.2s',
        },
        socialButtonsBlockButtonText: {
            color: '#f1f5f9',
            fontWeight: '600',
        },
        socialButtonsBlockButtonArrow: {
            color: '#94a3b8',
        },
        dividerRow: {
            color: '#475569',
        },
        dividerLine: {
            background: 'rgba(255,255,255,0.07)',
        },
        dividerText: {
            color: '#64748b',
            fontSize: '12px',
        },
        formFieldLabel: {
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
        },
        formFieldInput: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '10px',
            fontSize: '15px',
            padding: '11px 14px',
        },
        formFieldInputShowPasswordButton: {
            color: '#64748b',
        },
        formFieldAction: {
            color: '#3b82f6',
            fontWeight: '600',
            fontSize: '13px',
        },
        formFieldAction__password: {
            color: '#3b82f6',
            fontWeight: '600',
        },
        formButtonPrimary: {
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '15px',
            padding: '12px',
            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            transition: 'all 0.2s',
        },
        footerActionLink: {
            color: '#3b82f6',
            fontWeight: '700',
        },
        footer: {
            background: 'transparent',
        },
        footerAction: {
            color: '#64748b',
        },
        identityPreviewEditButton: {
            color: '#3b82f6',
        },
        alert: {
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '10px',
        },
        alertText: {
            color: '#f43f5e',
        },
        formButtonReset: {
            color: '#3b82f6',
            fontWeight: '600',
        },
        alternativeMethodsBlockButton: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '10px',
        },
        otpCodeFieldInput: {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '8px',
        },
    },
};

export default clerkAppearance;

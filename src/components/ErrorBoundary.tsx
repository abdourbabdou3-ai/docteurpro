'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex-center" style={{ padding: 'var(--spacing-3xl)', flexDirection: 'column', textAlign: 'center' }}>
                    <h2 className="text-danger mb-md">عذراً، حدث خطأ غير متوقع</h2>
                    <p className="text-muted mb-lg">يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        إعادة تحميل الصفحة
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

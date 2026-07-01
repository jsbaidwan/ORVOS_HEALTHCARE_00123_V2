import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true
        };
    }

    componentDidCatch(error, errorInfo) {
        //console.error('Application Error:', error, errorInfo);

        // Auto reload current URL after 500ms
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    render() {
        return this.props.children;
    }
}

export default ErrorBoundary;
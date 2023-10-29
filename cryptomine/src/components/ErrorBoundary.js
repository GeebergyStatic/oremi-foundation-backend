import React, { Component } from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    // Log the error to your error logging service (e.g., Sentry)
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { useState, useEffect } from 'react';

// Toast styles as a JavaScript object for inline styling
const toastStyles = {
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    minWidth: '300px',
    padding: '16px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    display: 'none',
  },
  show: {
    display: 'block',
    animation: 'slideIn 0.3s forwards',
  },
  success: {
    backgroundColor: '#d4edda',
    borderLeft: '4px solid #28a745',
    color: '#155724',
  },
  error: {
    backgroundColor: '#f8d7da',
    borderLeft: '4px solid #dc3545',
    color: '#721c24',
  },
  warning: {
    backgroundColor: '#fff3cd',
    borderLeft: '4px solid #ffc107',
    color: '#856404',
  },
  info: {
    backgroundColor: '#d1ecf1',
    borderLeft: '4px solid #17a2b8',
    color: '#0c5460',
  },
  toastTitle: {
    fontWeight: '600',
    marginBottom: '6px',
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
};

// CSS keyframes for animation
const toastAnimation = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Toast component
export const Toast = ({ visible, type, title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    
    let timer;
    if (visible) {
      // Auto-hide toast after 3 seconds if not manually closed
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, onClose]);

  // Combine styles based on state and type
  const getToastStyle = () => {
    const styles = {
      ...toastStyles.toast,
      ...(isVisible && toastStyles.show),
      ...(type && toastStyles[type]),
    };
    
    // Only set display if visible to allow animation to work
    if (isVisible) {
      styles.display = 'block';
    }
    
    return styles;
  };

  if (!visible && !isVisible) return null;

  return (
    <>
      <style>{toastAnimation}</style>
      <div style={getToastStyle()}>
        {title && <div style={toastStyles.toastTitle}>{title}</div>}
        <div>{message}</div>
      </div>
    </>
  );
};

// Hook for using toast throughout your application
export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    type: '',
    title: '',
    message: ''
  });

  const showToast = (type, title, message, duration = 3000) => {
    setToast({
      visible: true,
      type,
      title,
      message
    });

    // Auto-hide toast after specified duration
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
    // Helper functions for common toast types
    showSuccess: (title, message, duration) => showToast('success', title, message, duration),
    showError: (title, message, duration) => showToast('error', title, message, duration),
    showWarning: (title, message, duration) => showToast('warning', title, message, duration),
    showInfo: (title, message, duration) => showToast('info', title, message, duration)
  };
};

// Default export
export default Toast;
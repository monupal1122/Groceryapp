import React, { useState, useCallback, useEffect } from 'react';
import CustomAlert from '../components/CustomAlert';

let setAlertStateGlobal = null;

export const AlertManager = () => {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: null,
    onConfirm: null,
    onCancel: null,
    confirmButtonColor: null,
    otherButtonColor: null,
  });

  // Store setState function globally for access from SweetAlert API
  useEffect(() => {
    setAlertStateGlobal = setAlertState;
    return () => {
      setAlertStateGlobal = null;
    };
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleConfirm = () => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    hideAlert();
  };

  const handleCancel = () => {
    if (alertState.onCancel) {
      alertState.onCancel();
    } else {
      hideAlert();
    }
  };

  return (
    <CustomAlert
      visible={alertState.visible}
      onClose={hideAlert}
      title={alertState.title}
      message={alertState.message}
      type={alertState.type}
      confirmText={alertState.confirmText}
      cancelText={alertState.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmButtonColor={alertState.confirmButtonColor}
      otherButtonColor={alertState.otherButtonColor}
    />
  );
};

// Export a SweetAlert-like API for backward compatibility
const SweetAlert = {
  showAlertWithOptions: (options, callback) => {
    if (!setAlertStateGlobal) {
      console.warn('AlertManager not initialized. Make sure AlertManager is rendered in your app.');
      return;
    }

    const {
      title,
      subTitle,
      style = 'info',
      confirmButtonTitle = 'OK',
      otherButtonTitle = null,
      confirmButtonColor = null,
      otherButtonColor = null,
      cancellable = false,
    } = options;

    setAlertStateGlobal({
      visible: true,
      title: title || '',
      message: subTitle || '',
      type: style,
      confirmText: confirmButtonTitle,
      cancelText: otherButtonTitle,
      confirmButtonColor,
      otherButtonColor,
      onConfirm: callback ? () => {
        if (typeof callback === 'function') {
          callback('confirm');
        }
      } : null,
      onCancel: callback ? () => {
        if (typeof callback === 'function') {
          callback('other');
        }
      } : null,
    });
  },
};

export default SweetAlert;


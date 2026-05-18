import React from 'react';
import styles from './PendingApprovalModal.module.css';

const PendingApprovalModal = ({ isOpen, onClose, actionName = "perform this action" }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalIcon}>⏳</div>
                <h3 className={styles.modalTitle}>Account Pending Approval</h3>
                <p className={styles.modalMessage}>
                    Your account is still waiting for admin approval. You cannot {actionName} until your account is activated.
                </p>
                <p className={styles.modalHint}>
                    Please check your notifications or contact an administrator. You will receive a notification once your account is approved.
                </p>
                <div className={styles.modalActions}>
                    <button className={styles.primaryBtn} onClick={onClose}>
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovalModal;
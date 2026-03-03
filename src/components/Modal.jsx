function Modal({ children, onClose }) {
  return (
    <div
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={styles.close} onClick={onClose} aria-label="Close modal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 20, 40, 0.55)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "16px",
    animation: "fadeIn 0.15s ease",
  },
  modal: {
    position: "relative",
    borderRadius: "16px",
    overflow: "visible",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    boxShadow: "0 25px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)",
    animation: "slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  close: {
    position: "absolute",
    top: "14px",
    right: "14px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: "8px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    zIndex: 10,
    transition: "all 0.15s ease",
  },
};

export default Modal;


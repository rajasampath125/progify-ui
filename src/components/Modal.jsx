function Modal({ children, onClose }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.close} onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
  },
  close: {
    position: "absolute",
    top: "12px",
    right: "12px",
    border: "none",
    background: "#fff",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "18px",
  },
};

export default Modal;

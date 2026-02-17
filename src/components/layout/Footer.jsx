const Footer = () => {
  return (
    <footer
      style={{
        background: "#5e6a83",
        color: "#ffffff",
        textAlign: "center",
        padding: "12px",
        fontSize: "12px",
      }}
    >
      © {new Date().getFullYear()} ProgifyTech Resume Portal. All rights reserved.
    </footer>
  );
};

export default Footer;

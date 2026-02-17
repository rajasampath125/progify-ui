import { useState } from "react";
import PublicHeader from "../components/PublicHeader";
import Modal from "../components/Modal";
import CandidateLoginPage from "./CandidateLoginPage";
import Footer from "../components/layout/Footer"

function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <PublicHeader onLoginClick={() => setShowLogin(true)} />

      {/* HERO */}
      <section style={styles.hero}>
        <h1>Get High Paying Jobs Faster</h1>
        <p>ATS-optimized resumes, mock interviews, and more.</p>
      </section>

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <CandidateLoginPage onSuccess={() => setShowLogin(false)} />
        </Modal>
      )}
      <Footer></Footer>
    </>
  );
}

const styles = {
  hero: {
    padding: "80px 24px",
    textAlign: "center",
  },
};

export default HomePage;

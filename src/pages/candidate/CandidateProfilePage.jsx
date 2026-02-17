const CandidateProfilePage = () => {
  const profile = JSON.parse(
    localStorage.getItem("candidateProfile")
  );

  return (
    <div
      style={{
        paddingLeft: "25%",
        justifyContent: "center",   // horizontal center
        alignItems: "center",       // vertical center
      }}
    >
      <div style={{ padding: "24px", maxWidth: "900px" }}>
        <h2>My Profile</h2>

        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            background: "#fff",
          }}
        >
          <p><b>Name:</b> {profile?.name}</p>
          <p><b>Email:</b> {profile?.email}</p>
          {/* <p><b>Role:</b> {profile?.role}</p> */}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;

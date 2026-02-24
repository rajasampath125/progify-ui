const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 text-center text-xs py-4 px-4">
      <p>
        © {new Date().getFullYear()}{" "}
        <a
          href="https://www.clouvr.com"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-300 hover:text-indigo-200 transition-colors underline underline-offset-2"
        >
          ClouVR
        </a>{" "}
        Resume Portal. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

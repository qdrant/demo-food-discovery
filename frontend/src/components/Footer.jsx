import qdrantRedLogo from "../assets/qdrant-brandmark-red.png";
import qdrantWhiteLogo from "../assets/qdrant-brandmark-white.png";

function Footer({ theme }) {
  const logo = theme === "dark" ? qdrantWhiteLogo : qdrantRedLogo;

  const links = [
    {
      label: "GitHub",
      href: "https://github.com/qdrant/qdrant",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/qdrant",
    },
    {
      label: "X",
      href: "https://x.com/qdrant_engine",
    },
    {
      label: "Discord",
      href: "https://discord.com/invite/tdtYvXjC4h",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/channel/UC6ftm8PwH1RU_LM1jwG0LQA",
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-brand">
        <img className="footer-logo" src={logo} alt="Qdrant logo" />

        <span>Powered by Qdrant</span>
      </div>

      <nav className="footer-links">
        {links.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

export default Footer;

import qdrantRedLogo from "../assets/qdrant-brandmark-red.png";
import qdrantWhiteLogo from "../assets/qdrant-brandmark-white.png";

function Header({ theme, onToggleTheme, onOpenHowItWorks }) {
  const logo = theme === "dark" ? qdrantWhiteLogo : qdrantRedLogo;

  return (
    <header className="header">
      <div className="brand">
        <img className="brand-logo" src={logo} alt="Qdrant logo" />

        <span>Qdrant</span>
      </div>

      <nav className="nav">
        <button className="how-button" onClick={onOpenHowItWorks}>
          How it works
        </button>

        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </nav>
    </header>
  );
}

export default Header;

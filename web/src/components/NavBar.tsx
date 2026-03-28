import { NavLink } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";

export function NavBar() {
  const { theme, toggle } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-brand">Idea Lab</div>
      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `navbar-link${isActive ? " active" : ""}`
          }
        >
          Kanban
        </NavLink>
        <NavLink
          to="/graph"
          className={({ isActive }) =>
            `navbar-link${isActive ? " active" : ""}`
          }
        >
          Graph
        </NavLink>
        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            `navbar-link${isActive ? " active" : ""}`
          }
        >
          Portfolio
        </NavLink>
      </div>
      <div className="navbar-spacer" />
      <button className="theme-toggle" onClick={toggle} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
        {theme === "light" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
      </button>
    </nav>
  );
}

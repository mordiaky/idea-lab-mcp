import { NavLink } from "react-router-dom";

export function NavBar() {
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
    </nav>
  );
}

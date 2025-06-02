import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { logout } from "../store/authSlice";
import styles from "./Header.module.css";
import starWarsLogo from "../assets/star-wars-logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-[#070708] w-full mx-auto border-1 border-b-white">
      <nav className="w-full px-2 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">
          <Link to="/">
            <img src={starWarsLogo} alt="Star Wars logo" className="w-[64px]" />
          </Link>
        </div>
        <Link to="/" className={`${styles.nav_link}`}>
          Home
        </Link>
        {!isAuthenticated ? (
          <Link to="/login" className={`${styles.nav_link}`}>
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="text-red-500 font-bold cursor-pointer p-2"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;

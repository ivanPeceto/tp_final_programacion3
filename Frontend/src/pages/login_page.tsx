/**
 * @file login_page.tsx
 * @brief Componente de React que renderiza la página de inicio de sesión.
 * @details
 * Esta página proporciona la interfaz para que los usuarios se autentiquen en la aplicación.
 * Contiene un formulario para ingresar email y contraseña, maneja el estado de dichos
 * campos, y se comunica con el `auth_service` para validar las credenciales
 * contra el backend.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import styles from '../styles/login.module.css'; 
import { useAuth } from '../context/auth_context';


/**
 * @brief Componente funcional para la página de inicio de sesión.
 * @returns {React.ReactElement} El JSX que renderiza la página de login.
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  /**
   * @brief Efecto que se ejecuta cuando el estado de autenticación cambia.
   * @details Si el usuario se autentica exitosamente (`isAuthenticated` se vuelve true),
   * este efecto lo redirigirá a la página de gestión.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/gestion/pedidos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);


    if (!email || !password) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    try {
      await login(email, password);

    } catch (err: any) {
      console.error('Error de inicio de sesión: ', err);
      setError('Credenciales inválidas o error en el servidor.');
    }
  }

  const LogoIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path d="M12.375 3h-.75L3 12.375v-.75L12.375 3zm0 0L21 12.375v-.75L12.375 3zm0 0L3 20.999l9.375-9.374-9.375-9.375zM12.375 3l9.375 9.375-9.375 9.374 9.375-9.374z" />
    </svg>
  );


  return (
    <div className={styles.authPageContainer}>
      <div className={styles.formContainer}>


        <div className={styles.formLogo}>
          <LogoIcon />
        </div>
        <h2 className={styles.title}>LOG IN</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>

        <Link to="/register" className={styles.switchFormLink}>
          No tienes una cuenta? Registrarse
        </Link>
      </div>
    </div>
  );
};

export default LoginPage; 
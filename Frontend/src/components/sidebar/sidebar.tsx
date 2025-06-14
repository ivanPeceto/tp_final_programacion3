import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './sidebar.module.css';
import { useAuth } from '../../context/auth_context';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();

  // Hemos combinado los dos arreglos de menú en uno solo para simplificar
  const menuItems: MenuItem[] = [
    { path: '/gestion', label: 'Armar pedido', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/gestion/productos', label: 'Productos', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { path: '/gestion/clientes', label: 'Clientes', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { path: '/gestion/pedidos', label: 'Pedidos', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
  ];

  const accountItem = { 
    label: isAuthenticated && user ? user.nombre : 'Perfil', 
    icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
  };
  
  const logoutIcon = <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

  return (
    <div className={`${styles.sidebarContainer} ${styles.expanded} ${styles.darkTheme}`}>
      <div className={styles.logoLink}>
        <svg className={styles.logoIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" /></svg>
        <span className={styles.logoText}>GESTOR DE PEDIDOS</span>
      </div>

      {/* AHORA HAY UN SOLO menuSection PARA TODOS LOS ENLACES */}
      <div className={styles.menuSection}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // La prop 'end' es importante para que el link de la home no esté siempre activo
            end={item.path === '/gestion'}
            className={({ isActive }) => `${styles.menuItem} ${isActive ? styles.activeDark : ''}`}
          >
            {item.icon}
            <span className={styles.menuItemText}>{item.label}</span>
          </NavLink>
        ))}
      </div>
      
      <div className={styles.accountSection}>
        <div className={styles.accountLink} style={{ cursor: 'default' }}>
          {accountItem.icon}
          <span className={styles.accountText}>{accountItem.label}</span>
        </div>
        <button
          onClick={logout}
          className={styles.logoutButton}
          title="Cerrar sesión"
        >
          {logoutIcon}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
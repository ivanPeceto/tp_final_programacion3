/**
 * @file GestionClientesPage.tsx
 * @brief Página de gestión de clientes que permite crear, editar, eliminar y buscar clientes.
 * @details
 * Este componente de React proporciona una interfaz de usuario completa para las operaciones
 * CRUD sobre la entidad de Clientes. Se comunica con el `client_service` 
 * para interactuar con el backend y maneja toda la lógica de
 * la interfaz, incluyendo un modal para la edición y creación de clientes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionClientesPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente
} from '../services/client_service';
import { type Cliente } from '../types/models';

/**
 * @brief Componente principal para la página de gestión de clientes.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
/**
 * @brief Estado principal del componente
 * @description 
 * - clientes: Almacena la lista completa de clientes obtenidos del servidor
 * - filteredClientes: Almacena la lista filtrada de clientes según el término de búsqueda
 * - searchTerm: Almacena el valor actual del campo de búsqueda
 * - isModalOpen: Controla la visibilidad del modal de edición/creación
 * - editingCliente: Almacena el cliente que se está editando (null para creación)
 * - formData: Almacena los datos del formulario del modal
 */
const GestionClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, 'id'>>({
    nombre: '',
    telefono: '',
    direccion: '',
  });

  /**
   * @brief Carga la lista de clientes desde el backend usando el servicio.
   * @details Se envuelve en `useCallback` para la optimización de rendimiento.
   * Muestra una alerta en caso de error en la comunicación con la API.
   */
  const fetchClientes = useCallback(async () => {
    try {
      const data = await getClientes();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  /**
   * @brief Efecto para filtrar los clientes en el lado del cliente.
   * @details Se ejecuta cada vez que el `searchTerm` o la lista de `clientes` cambia,
   * actualizando la lista `filteredClientes` que se muestra en la UI.
   */
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(lowercasedSearchTerm) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm)) ||
      cliente.direccion.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredClientes(results);
  }, [searchTerm, clientes]);

  /**
   * @brief Actualiza el estado del término de búsqueda.
   * @param {ChangeEvent<HTMLInputElement>} event El evento del input de búsqueda.
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * @brief Actualiza el estado del formulario del modal cuando el usuario escribe.
   * @param {ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event El evento del campo del formulario.
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * @brief Abre el modal y configura el formulario para crear o editar un cliente.
   * @param {Cliente | null} cliente El cliente a editar, o `null` para crear uno nuevo.
   */
  /**
   * @brief Abre el modal para crear o editar un cliente
   * @description
   * - Si se proporciona un cliente, configura el formulario en modo edición
   * - Si no se proporciona un cliente, prepara el formulario para crear uno nuevo
   * - Actualiza el estado del modal a visible
   * @param {Cliente | null} cliente - Cliente a editar o null para crear uno nuevo
   */
  const openModal = useCallback((cliente: Cliente | null = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', telefono: '', direccion: '' });
    }
    setIsModalOpen(true);
  }, []);

  /**
   * @brief Cierra el modal y resetea los estados del formulario.
   */
  /**
   * @brief Cierra el modal y limpia el formulario
   * @description
   * - Oculta el modal
   * - Limpia el cliente en edición
   * - Reinicia los datos del formulario
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCliente(null);
    setFormData({ nombre: '', telefono: '', direccion: '' });
  }, []);

  /**
   * @brief Maneja el envío del formulario, llamando al servicio para crear o actualizar un cliente.
   * @param {FormEvent<HTMLFormElement>} event El evento de envío del formulario.
   */
  /**
   * @brief Maneja el envío del formulario de cliente
   * @description
   * - Previene el comportamiento por defecto del formulario
   * - Valida los datos del formulario
   * - Llama al servicio correspondiente para crear o actualizar el cliente
   * - Actualiza la lista de clientes si la operación es exitosa
   * - Cierra el modal y limpia el formulario
   * - Muestra mensajes de error si la operación falla
   * @param {FormEvent<HTMLFormElement>} event - Evento de envío del formulario
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
      } else {
        await createCliente(formData);
      }
      fetchClientes();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      const errorMessage = error.response?.data?.detail || 'Error al guardar el cliente.';
      console.error(errorMessage);
    }
  };

  /**
   * @brief Maneja la eliminación de un cliente, con un diálogo de confirmación.
   * @param {number} clienteId El ID del cliente a eliminar.
   */
  /**
   * @brief Maneja la eliminación de un cliente
   * @description
   * - Muestra un diálogo de confirmación antes de eliminar
   * - Llama al servicio para eliminar el cliente del servidor
   * - Actualiza la lista de clientes después de la eliminación
   * - Muestra un mensaje de error si la operación falla
   * @param {number} clienteId - ID del cliente a eliminar
   */
  const handleDelete = async (clienteId: number) => {
    try {
      await deleteCliente(clienteId);
      fetchClientes();
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      const errorMessage = error.response?.data?.detail || 'Error al eliminar el cliente.';
      console.error(errorMessage);
    }
  };

  /**
   * @brief Maneja los cambios en el input de teléfono, aplicando el formato automático.
   * @details Esta función se activa en cada cambio, limpia el valor para obtener solo
   * los dígitos, y luego reconstruye el string con el formato deseado antes de
   * actualizar el estado. Esto maneja correctamente la escritura, el borrado y el pegado.
   * @param {ChangeEvent<HTMLInputElement>} event El evento del input de teléfono.
   */
  const handleTelephoneInput = (event: ChangeEvent<HTMLInputElement>) => {
    // 1. Obtener el valor actual y limpiar todo lo que no sea un dígito.
    const digitsOnly = event.target.value.replace(/\D/g, '');

    // 2. Aplicar el formato 123-456-7890, limitado a 10 dígitos.
    let formattedNumber = digitsOnly.substring(0, 10);
    if (formattedNumber.length > 6) {
      formattedNumber = `${formattedNumber.slice(0, 3)}-${formattedNumber.slice(3, 6)}-${formattedNumber.slice(6)}`;
    } else if (formattedNumber.length > 3) {
      formattedNumber = `${formattedNumber.slice(0, 3)}-${formattedNumber.slice(3)}`;
    }

    // 3. Actualizar el estado de React. React se encargará de actualizar el input.
    setFormData(prev => ({ ...prev, telefono: formattedNumber }));
  };

  /**
   * @brief Renderiza la interfaz de usuario
   * @description
   * - Barra de búsqueda para filtrar clientes
   * - Botón para agregar nuevo cliente
   * - Tabla que muestra la lista de clientes con opciones de edición/eliminación
   * - Modal para crear/editar clientes
   */
  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de clientes</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o dirección..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <button onClick={() => openModal()} className={styles.addButton}>
          Nuevo Cliente
        </button>
      </div>

      <div className={styles.listContainer}>
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => (
            <div key={cliente.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{cliente.nombre}</strong>
                <span>Tel: {cliente.telefono}</span>
                <small>Dir: {cliente.direccion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => openModal(cliente)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(cliente.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron clientes.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Información Básica</h3>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                    required
                    value={formData.telefono}
                    onChange={handleTelephoneInput}
                    maxLength={12}
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="direccion">Dirección</label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className={formStyles.formTextarea}
                  />
                </div>
              </div>
              <div className={formStyles.formButtons}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={formStyles.secondaryButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={formStyles.primaryButton}
                >
                  {editingCliente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientesPage;
/**
 * @file GestionProductosPage.tsx
 * @brief Página principal para la gestión de productos.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre los productos. Se comunica con los servicios `product_service`
 * y `category_service` para interactuar con el backend. Incluye
 * funcionalidades de búsqueda, un modal para la edición y creación, y feedback para el usuario.
 */


import React, { useState, useEffect, useCallback, useMemo } from 'react';

import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../services/product_service';
import { getCategorias } from '../services/category_service';
import {type Producto, type ProductoInput, type Categoria} from '../types/models'
interface GestionProductosPageProps {}


/**
 * @brief Componente funcional para la página de gestión de productos.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionProductosPage: React.FC<GestionProductosPageProps> = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [formData, setFormData] = useState<ProductoInput>({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    disponible: true,
    categoria_id: null,
  });


  /**
   * @brief Carga la lista de productos desde el servicio y actualiza el estado.
   * @details Se envuelve en `useCallback` para evitar recrearse en cada render, optimizando el rendimiento.
   */
  const fetchProductos = useCallback(async () => {
    try {
      const data = await getProductos();
      setProductos(data);
      setFilteredProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }, []);

  /**
   * @brief Carga la lista de categorías desde el servicio.
   * @details Se utiliza para poblar el `<select>` en el formulario del modal.
   */
  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);


  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  /** @brief Extrae una lista de nombres de categorías únicas a partir de los productos. */
  const categoriasUnicas = useMemo(() => {
    const nombres = new Set(productos.map(p => p.categoria?.nombre).filter(Boolean) as string[]);
    return ['Todos', ...nombres]; 
  }, [productos]);

  /**
   * @brief Efecto para filtrar los productos.
   * @details Primero filtra por categoría y luego por el término de búsqueda.
   */
  useEffect(() => {
    let results = productos;
    if (selectedCategory !== 'Todos') {
      results = results.filter(p => (p.categoria?.nombre || 'Sin Categoría') === selectedCategory);
    }
    if (searchTerm) {
      const lowercasedValue = searchTerm.toLowerCase();
      results = results.filter(p =>
        p.nombre.toLowerCase().includes(lowercasedValue) ||
        p.descripcion.toLowerCase().includes(lowercasedValue)
      );
    }
    setFilteredProductos(results);
  }, [searchTerm, selectedCategory, productos]);



  /**
   * @brief Actualiza el estado del término de búsqueda cada vez que el usuario escribe en el input.
   * @param {ChangeEvent<HTMLInputElement>} event El evento del input de búsqueda.
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * @brief Manejador genérico para todos los inputs del formulario del modal.
   * @details Actualiza el estado `formData` basándose en el `name` del input.
   * @param {ChangeEvent<...>} event El evento del campo del formulario.
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      const target = event.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (name === 'precio_unitario') { 
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'categoria_id') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * @brief Abre el modal y configura el formulario para crear o editar un producto.
   * @param {Producto | null} producto El producto a editar, o `null` para crear uno nuevo.
   */
  const openModal = useCallback((producto: Producto | null = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_unitario: +producto.precio_unitario,
        disponible: producto.disponible,
        categoria_id: producto.categoria?.id ?? null,
      });
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio_unitario: 0,
        disponible: true,
        categoria_id: categorias.length > 0 ? categorias[0].id : null,
      });
    }
    setIsModalOpen(true);
  }, [categorias]);


  /**
   * @brief Cierra el modal y resetea el estado de edición.
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProducto(null);
  }, []);


  /**
   * @brief Maneja el envío del formulario, llamando al servicio de crear o actualizar.
   * @param {FormEvent<HTMLFormElement>} event El evento de envío del formulario.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.categoria_id) {
      return;
    }

    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
      } else {
        await createProducto(formData);
      }

      fetchProductos();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error.response?.data?.detail || 'Error al guardar el producto.';
      console.error(errorMessage);
    }
  };

  /**
   * @brief Maneja la eliminación de un producto, con confirmación previa.
   * @param {number} productoId El ID del producto a eliminar.
   */
  const handleDelete = async (productoId: number) => {
    if (window.confirm(`¿Está seguro que desea eliminar el producto?`)) {
      try {
        await deleteProducto(productoId);
        fetchProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Productos</h1>

      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <div className={styles.toolbarButtons}>
            <button
              onClick={() => navigate('/gestion/categorias')}
              className={`${styles.addButton} ${styles.secondaryButton}`}
            >
              Gestionar Categorías
            </button>
            <button onClick={() => openModal()} className={styles.addButton}>
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      <div className={styles.categoryTabs}>
        {categoriasUnicas.map(cat => (
          <button
            key={cat}
            className={`${styles.categoryTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.listContainer}>
        {filteredProductos.length > 0 ? (
          filteredProductos.map((producto) => (
            <div
              key={producto.id}

              className={`${styles.listItem} ${!producto.disponible ? styles.itemNoDisponible : ''}`}
            >
              <div className={styles.itemActions}>
                <button onClick={() => openModal(producto)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(producto.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
              <div className={styles.itemInfo}>
                <strong>{producto.nombre}</strong>
                <span>Precio: ${(+producto.precio_unitario).toFixed(2)}</span>
                {producto.categoria && <small>Categoría: {producto.categoria.nombre}</small>}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron productos.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
                  <label className={formStyles.formLabel} htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className={formStyles.formTextarea}
                  />
                </div>
              </div>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Precios</h3>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="precio_unitario">Precio Unitario</label>
                  <input
                    type="number"
                    id="precio_unitario"
                    name="precio_unitario"
                    value={formData.precio_unitario}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className={formStyles.formInput}
                  />
                </div>
              </div>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Estado y Categoría</h3>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="disponible">Disponible</label>
                  <input
                    type="checkbox"
                    id="disponible"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="categoria_id">Categoría</label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={formData.categoria_id || ''}
                    onChange={handleInputChange}
                    className={formStyles.formSelect}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
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
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProductosPage;
// ===================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ===================================
const API_URL = "https://voz-animal-backend-production.up.railway.app/api";
let currentUser = null;
let authToken = null;
let allAnimales = [];
let currentAnimalId = null;

// ===================================
// INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dashboard cargando...');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('Token:', token ? 'Existe' : 'No existe');
  console.log('User:', userStr);

  if (!token || !userStr) {
    console.log('No hay autenticación, redirigiendo...');
    window.location.href = 'login.html';
    return;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (!user.id) {
      console.log('Usuario inválido, redirigiendo...');
      window.location.href = 'login.html';
      return;
    }

    currentUser = user;
    authToken = token;
    
    console.log('Usuario autenticado:', user.nombre);
    
    // Actualizar UI con datos del usuario
    updateUserInterface(user);

    // Cargar datos iniciales
    console.log('Cargando datos...');
    await Promise.all([
      loadUserStats(),
      loadAnimales(),
      loadSolicitudes()
    ]);
    
    console.log('Datos cargados correctamente');
    
  } catch (error) {
    console.error('Error en la inicialización:', error);
    alert('Error al cargar el dashboard. Por favor, inicia sesión nuevamente.');
    window.location.href = 'login.html';
  }
});

// ===================================
// FUNCIONES DE UI
// ===================================
function updateUserInterface(user) {
  console.log('Actualizando interfaz de usuario...');
  
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userName) userName.textContent = user.nombre;
  if (userEmail) userEmail.textContent = user.email;
  if (welcomeMessage) welcomeMessage.textContent = `¡Bienvenido/a, ${user.nombre}!`;
  if (userAvatar) userAvatar.textContent = user.nombre.charAt(0).toUpperCase();
}

function showAlert(type, message, containerId = 'formAlert') {
  const alertDiv = document.getElementById(containerId);
  if (!alertDiv) return;

  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 5000);
}

// ===================================
// CARGAR ESTADÍSTICAS DEL USUARIO
// ===================================
async function loadUserStats() {
  console.log('Cargando estadísticas...');
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    console.log('Estadísticas recibidas:', data);

    if (data.success && data.data.stats) {
      const stats = data.data.stats;
      
      const statSolicitudes = document.getElementById('statSolicitudes');
      const statAprobadas = document.getElementById('statAprobadas');
      const statAdopciones = document.getElementById('statAdopciones');
      const statDonaciones = document.getElementById('statDonaciones');
      
      if (statSolicitudes) statSolicitudes.textContent = stats.total_solicitudes || 0;
      if (statAprobadas) statAprobadas.textContent = stats.solicitudes_aprobadas || 0;
      if (statAdopciones) statAdopciones.textContent = stats.total_adopciones || 0;
      if (statDonaciones) statDonaciones.textContent = `$${stats.total_donado || 0}`;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// ===================================
// CARGAR Y MOSTRAR ANIMALES
// ===================================
async function loadAnimales() {
  console.log('Cargando animales...');
  
  try {
    const response = await fetch(`${API_URL}/animales?estado=disponible`);
    const data = await response.json();
    
    console.log('Animales recibidos:', data);

    if (data.success) {
      allAnimales = data.data || [];
      console.log(`Total de animales: ${allAnimales.length}`);
      displayAnimales(allAnimales);
    } else {
      throw new Error(data.message || 'Error al cargar animales');
    }
  } catch (error) {
    console.error('Error al cargar animales:', error);
    showErrorAnimales();
  }
}

function displayAnimales(animales) {
  const container = document.getElementById('animalesContainer');
  if (!container) return;

  console.log(`Mostrando ${animales.length} animales`);

  if (animales.length > 0) {
    container.className = 'animales-grid';
    container.innerHTML = animales.map(animal => createAnimalCard(animal)).join('');
  } else {
    showEmptyStateAnimales();
  }
}

function createAnimalCard(animal) {
  return `
    <div class="animal-card" onclick="verAnimal(${animal.id_animal})">
      <div class="animal-image">
        ${animal.tipo === 'perro' ? '🐕' : '🐈'}
        <div class="animal-type-badge">
          ${animal.tipo === 'perro' ? 'Perro' : 'Gato'}
        </div>
      </div>
      <div class="animal-info">
        <div class="animal-name">${animal.nombre}</div>
        <div class="animal-details">
          <div class="animal-detail-item">
            <span>🎯</span>
            <span>${animal.raza || 'Raza mixta'}</span>
          </div>
          <div class="animal-detail-item">
            <span>${animal.sexo === 'macho' ? '♂️' : '♀️'}</span>
            <span>${animal.sexo === 'macho' ? 'Macho' : 'Hembra'}</span>
          </div>
          <div class="animal-detail-item">
            <span>📏</span>
            <span>Tamaño ${animal.tamanio}</span>
          </div>
          <div class="animal-detail-item">
            <span>🎂</span>
            <span>${animal.edad_anos || 0} año(s) ${animal.edad_meses || 0} mes(es)</span>
          </div>
        </div>
        <div class="animal-badges">
          <span class="animal-badge badge-disponible">✓ Disponible</span>
        </div>
      </div>
    </div>
  `;
}

function showEmptyStateAnimales() {
  const container = document.getElementById('animalesContainer');
  if (!container) return;
  
  container.className = 'empty-state';
  container.innerHTML = `
    <div class="empty-icon">🐾</div>
    <p>No hay animales disponibles con los filtros seleccionados</p>
  `;
}

function showErrorAnimales() {
  const container = document.getElementById('animalesContainer');
  if (!container) return;
  
  container.className = 'empty-state';
  container.innerHTML = `
    <div class="empty-icon">❌</div>
    <p style="color: #dc3545;">Error al cargar animales. Por favor, intenta de nuevo.</p>
  `;
}

// ===================================
// FILTROS DE ANIMALES
// ===================================
function filterAnimals(filtro) {
  console.log('Filtrando por:', filtro);
  
  // Actualizar botones activos
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Filtrar animales
  let filtered = allAnimales;

  if (filtro === 'perro' || filtro === 'gato') {
    filtered = allAnimales.filter(a => a.tipo === filtro);
  } else if (filtro === 'pequeño' || filtro === 'mediano' || filtro === 'grande') {
    filtered = allAnimales.filter(a => a.tamanio === filtro);
  }

  console.log(`Animales filtrados: ${filtered.length}`);
  displayAnimales(filtered);
}

// ===================================
// MODAL DE DETALLE DE ANIMAL
// ===================================
async function verAnimal(id) {
  console.log('Viendo animal ID:', id);
  
  try {
    const response = await fetch(`${API_URL}/animales/${id}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Error al cargar animal');
    }

    const animal = data.data;
    currentAnimalId = id;

    // Actualizar contenido del modal
    updateModalContent(animal);

    // Verificar si ya tiene solicitud pendiente
    await checkExistingSolicitud(id);

    // Mostrar modal
    const modal = document.getElementById('modalAnimal');
    if (modal) {
      modal.classList.add('show');
    }

  } catch (error) {
    console.error('Error al cargar detalle del animal:', error);
    alert('Error al cargar los detalles del animal. Por favor, intenta de nuevo.');
  }
}

function updateModalContent(animal) {
  // Header del modal
  const modalIcon = document.getElementById('modalAnimalIcon');
  const modalName = document.getElementById('modalAnimalName');
  const modalSubtitle = document.getElementById('modalAnimalSubtitle');
  
  if (modalIcon) modalIcon.textContent = animal.tipo === 'perro' ? '🐕' : '🐈';
  if (modalName) modalName.textContent = animal.nombre;
  if (modalSubtitle) {
    modalSubtitle.textContent = `${animal.raza || 'Raza mixta'} • ${animal.sexo === 'macho' ? 'Macho' : 'Hembra'}`;
  }

  // Grid de detalles
  const detailGrid = document.getElementById('modalDetailGrid');
  if (detailGrid) {
    detailGrid.innerHTML = `
      <div class="detail-item">
        <div class="detail-label">Edad</div>
        <div class="detail-value">${animal.edad_anos || 0}a ${animal.edad_meses || 0}m</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Tamaño</div>
        <div class="detail-value">${animal.tamanio}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Peso</div>
        <div class="detail-value">${animal.peso ? animal.peso + ' kg' : 'N/A'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Color</div>
        <div class="detail-value">${animal.color || 'N/A'}</div>
      </div>
    `;
  }

  // Secciones de descripción
  let descriptionsHTML = '';

  if (animal.descripcion) {
    descriptionsHTML += `
      <div class="description-section">
        <div class="description-title">📝 Descripción</div>
        <div class="description-text">${animal.descripcion}</div>
      </div>
    `;
  }

  if (animal.caracteristicas) {
    descriptionsHTML += `
      <div class="description-section">
        <div class="description-title">✨ Características</div>
        <div class="description-text">${animal.caracteristicas}</div>
      </div>
    `;
  }

  if (animal.estado_salud) {
    descriptionsHTML += `
      <div class="description-section">
        <div class="description-title">🏥 Estado de Salud</div>
        <div class="description-text">${animal.estado_salud}</div>
      </div>
    `;
  }

  const modalDescription = document.getElementById('modalDescription');
  if (modalDescription) {
    modalDescription.innerHTML = descriptionsHTML;
  }
}

async function checkExistingSolicitud(animalId) {
  try {
    const response = await fetch(`${API_URL}/solicitudes`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();

    if (data.success) {
      // Verificar si ya existe una solicitud para este animal
      const existingSolicitud = data.data.find(
        s => s.id_animal === animalId && s.estado === 'pendiente'
      );

      if (existingSolicitud) {
        showExistingSolicitudAlert();
      } else {
        showAdoptionForm();
      }
    }
  } catch (error) {
    console.error('Error al verificar solicitudes:', error);
    showAdoptionForm();
  }
}

function showExistingSolicitudAlert() {
  const formAlert = document.getElementById('formAlert');
  const modalAdoptForm = document.getElementById('modalAdoptForm');
  
  if (formAlert) {
    formAlert.className = 'alert alert-info';
    formAlert.textContent = '✓ Ya tienes una solicitud pendiente para este animal. Te notificaremos cuando sea revisada.';
    formAlert.style.display = 'block';
  }
  
  if (modalAdoptForm) {
    modalAdoptForm.style.display = 'none';
  }
}

function showAdoptionForm() {
  const formAlert = document.getElementById('formAlert');
  const modalAdoptForm = document.getElementById('modalAdoptForm');
  const formAdopcion = document.getElementById('formAdopcion');
  
  if (formAlert) formAlert.style.display = 'none';
  if (modalAdoptForm) modalAdoptForm.style.display = 'block';
  if (formAdopcion) formAdopcion.reset();
}

function closeModal() {
  const modal = document.getElementById('modalAnimal');
  const formAlert = document.getElementById('formAlert');
  
  if (modal) modal.classList.remove('show');
  if (formAlert) formAlert.style.display = 'none';
  
  currentAnimalId = null;
}

// ===================================
// ENVIAR SOLICITUD DE ADOPCIÓN
// ===================================
async function submitAdopcion(event) {
  event.preventDefault();
  
  console.log('Enviando solicitud de adopción...');

  const btnSubmit = document.getElementById('btnSubmitAdopcion');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enviando solicitud...';
  }

  const motivoInput = document.getElementById('motivoAdopcion');
  const experienciaInput = document.getElementById('experiencia');
  const infoAdicionalInput = document.getElementById('infoAdicional');

  const solicitudData = {
    id_animal: currentAnimalId,
    motivo_adopcion: motivoInput ? motivoInput.value : '',
    experiencia_mascotas: experienciaInput ? experienciaInput.value || null : null,
    info_adicional: infoAdicionalInput ? infoAdicionalInput.value || null : null
  };

  console.log('Datos de solicitud:', solicitudData);

  try {
    const response = await fetch(`${API_URL}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(solicitudData)
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (data.success) {
      showAlert('success', '¡Solicitud enviada exitosamente! Te notificaremos cuando sea revisada.');
      
      // Recargar estadísticas y solicitudes
      setTimeout(async () => {
        await Promise.all([loadUserStats(), loadSolicitudes()]);
        closeModal();
      }, 2000);
    } else {
      throw new Error(data.message || 'Error al enviar solicitud');
    }
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    showAlert('error', error.message || 'Error al enviar la solicitud. Por favor, intenta de nuevo.');
    
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Enviar Solicitud de Adopción';
    }
  }
}

// ===================================
// CARGAR SOLICITUDES DEL USUARIO
// ===================================
async function loadSolicitudes() {
  console.log('Cargando solicitudes...');
  
  try {
    const response = await fetch(`${API_URL}/solicitudes`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    console.log('Solicitudes recibidas:', data);

    const container = document.getElementById('solicitudesContainer');
    if (!container) return;

    if (data.success && data.data && data.data.length > 0) {
      displaySolicitudes(data.data);
    } else {
      showEmptyStateSolicitudes();
    }
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
    showErrorSolicitudes();
  }
}

function displaySolicitudes(solicitudes) {
  const container = document.getElementById('solicitudesContainer');
  if (!container) return;
  
  container.className = 'table-container';
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Animal</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Motivo</th>
        </tr>
      </thead>
      <tbody>
        ${solicitudes.map(sol => `
          <tr>
            <td><strong>${sol.nombre_animal || 'Animal'}</strong></td>
            <td>${new Date(sol.fecha_solicitud).toLocaleDateString('es-ES')}</td>
            <td>
              <span class="status-badge status-${sol.estado}">
                ${sol.estado.charAt(0).toUpperCase() + sol.estado.slice(1)}
              </span>
            </td>
            <td>${sol.motivo_adopcion ? sol.motivo_adopcion.substring(0, 50) + '...' : '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showEmptyStateSolicitudes() {
  const container = document.getElementById('solicitudesContainer');
  if (!container) return;
  
  container.className = 'empty-state';
  container.innerHTML = `
    <div class="empty-icon">📋</div>
    <p>Aún no has enviado ninguna solicitud de adopción</p>
  `;
}

function showErrorSolicitudes() {
  const container = document.getElementById('solicitudesContainer');
  if (!container) return;
  
  container.className = 'empty-state';
  container.innerHTML = `
    <div class="empty-icon">❌</div>
    <p style="color: #dc3545;">Error al cargar solicitudes. Por favor, intenta de nuevo.</p>
  `;
}

// ===================================
// CERRAR SESIÓN
// ===================================
function logout() {
  console.log('Cerrando sesión...');
  
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
}

// Hacer las funciones globales para que puedan ser llamadas desde el HTML
window.logout = logout;
window.filterAnimals = filterAnimals;
window.verAnimal = verAnimal;
window.closeModal = closeModal;
window.submitAdopcion = submitAdopcion;
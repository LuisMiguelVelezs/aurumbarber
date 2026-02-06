# Aurum Barber

Sistema de gestión de reservas y administración para barbería.

## Descripción

Aurum Barber es una aplicación web completa para la gestión de una barbería, que incluye:
- Sistema de reservas en línea para clientes
- Panel administrativo para gestión de citas
- Gestión de barberos
- Catálogo de servicios y productos
- Dashboard con estadísticas

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore Database)
- **Autenticación**: Firebase Auth
- **Hosting**: Firebase Hosting (por configurar)

## Estructura del Proyecto

```
PrBarber/
├── Cliente/              # Aplicación del cliente
│   ├── Css/             # Estilos
│   ├── Js/              # Scripts JavaScript
│   ├── Menu/            # Menús de servicios
│   ├── admin.html       # Panel administrativo
│   └── Inicio.html      # Página principal
├── CSS/                 # Estilos globales
├── IMG/                 # Imágenes y recursos
└── public/              # Archivos públicos
    └── index.html       # Punto de entrada
```

## Instalación y Configuración

### Requisitos previos
- Navegador web moderno
- Cuenta de Firebase

### Configuración

1. Clona el repositorio:
```bash
git clone https://github.com/LuisMiguelVelezs/aurumbarber.git
cd aurumbarber
```

2. Configura Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilita Firestore Database
   - Copia tu configuración en `Cliente/Js/firebase.js`

3. Abre `Cliente/Inicio.html` en tu navegador

## 🔧 Características

### Para Clientes
-  Reserva de citas online
-  Selección de barbero
-  Selección de servicios (Cabello, Barba, Facial, Productos)
-  Catálogo de productos

### Para Administradores
-  Panel de control con estadísticas
-  Gestión de reservas (crear, editar, eliminar)
-  Gestión de barberos
-  Búsqueda y filtrado de reservas
-  Validación de horarios disponibles

##  Uso

### Acceso al Panel de Administración
Abre `Cliente/admin.html` para acceder al panel administrativo donde podrás:
- Ver todas las reservas
- Agregar nuevas reservas manualmente
- Editar o eliminar reservas existentes
- Gestionar barberos
- Ver estadísticas del negocio

##  Seguridad

**Importante**: Las reglas de Firestore están en modo desarrollo. Antes de producción:
1. Implementa autenticación de usuarios
2. Configura reglas de seguridad en Firebase
3. Protege el panel de administración

##  Desarrollo

### Comandos Git útiles

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "descripción del cambio"

# Subir a GitHub
git push

# Ver historial
git log --oneline
```

##  Roadmap

- [ ] Implementar autenticación de usuarios
- [ ] Sistema de notificaciones por email
- [ ] Integración de pagos online
- [ ] App móvil (PWA)
- [ ] Sistema de fidelización de clientes

##  Autor

**Luis Miguel Vélez**
- GitHub: [@LuisMiguelVelezs](https://github.com/LuisMiguelVelezs)

##  Licencia

Este proyecto es de código privado.

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

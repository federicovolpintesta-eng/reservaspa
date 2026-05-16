# 🏨 Sistema de Reservas de Turnos — Los Pinos Resort & Spa Termal

¡Bienvenido al **Sistema de Reservas de Los Pinos Spa**! Una solución Full Stack robusta, interactiva y de nivel profesional diseñada específicamente para optimizar la gestión y asignación de turnos dentro del sector de la hospitalidad de alta gama.

Este proyecto surge de la necesidad de digitalizar y automatizar los flujos operativos de un resort, conectando de forma directa la experiencia del huésped desde su dispositivo móvil con la administración interna del hotel en tiempo real.

---

## 🚀 Características Clave

### 👨‍💻 Para el Huésped (Frontend SPA)
* **Validación de Identidad Inmediata:** Formulario de acceso simplificado y seguro mediante número de habitación y apellido del huésped.
* **Catálogo de Servicios Dinámico:** Navegación fluida e interactiva por los distintos tratamientos y masajes disponibles en el Spa.
* **Reserva en 4 Etapas:** Flujo de usuario limpio estructurado en etapas lógicas (*Identificación ➔ Selección de Servicio ➔ Grilla Horaria ➔ Confirmación*).
* **Comprobantes Nativos:** Generación automática de comprobantes de confirmación de reserva en formato **PDF** listos para descargar.

### ⚙️ Para la Administración (Panel Interno)
* **Tablero Kanban Interactivo:** Control visual absoluto de los turnos programados mediante una interfaz intuitiva con soporte de **Drag & Drop** (Arrastrar y Soltar).
* **Métricas Operativas en Tiempo Real:** Visualización automatizada de analíticas clave como porcentajes de ocupación diaria, slots disponibles y rendimiento del personal.
* **Sincronización Asíncrona:** Cada movimiento o actualización en el tablero dispara silenciosamente peticiones `PUT` estructuradas hacia el backend, actualizando el estado de forma inmediata.

### 🛡️ Reglas de Negocio Estrictas (Backend)
* **Control de Concurrencia Absoluto:** El backend actúa como regulador estricto del inventario, impidiendo de forma nativa la asignación de turnos duplicados (*overbooking*) para un mismo masajista o bloque horario.
* **Validación Temporal Dinámica:** Enfoque robusto que rechaza automáticamente solicitudes en fechas pasadas y se adapta estrictas a los rangos horarios reales de atención (Turno Mañana y Tarde).

---

## 🛠️ Stack Tecnológico

* **Frontend:** HTML5, CSS3 Semántico (Variables globales, Layouts responsivos con Flexbox/Grid), JavaScript Vanilla (ES6+), Chart.js para analíticas.
* **Backend:** Node.js, Express, Arquitectura de API REST estructurada (`GET`, `POST`, `PUT`, `DELETE`).
* **Base de Datos & Autenticación:** Supabase (PostgreSQL) para una persistencia segura, relacional y de bajísima latencia.
* **Validación:** Lógica robusta integrada con `validator.js` y middleware personalizado de filtrado.
* **Despliegue:** Render (Servidor en producción acoplado a la base de datos).

---

## 📐 Arquitectura del Proyecto

```text
├── src/
│   ├── config/          # Configuración y conexión a Supabase/Base de datos
│   ├── controllers/     # Lógica de negocio (Controladores de turnos, servicios y usuarios)
│   ├── middlewares/     # Validaciones de seguridad y manejo de concurrencia
│   ├── models/          # Modelos y esquemas de datos relacionales
│   ├── routes/          # Rutas de la API REST (/api/reservas, /api/services)
│   └── public/          # Interfaz Frontend (HTML, CSS, JS e imágenes del SPA)
├── server.js            # Punto de entrada principal de la aplicación Node.js
└── package.json         # Dependencias y scripts del proyecto

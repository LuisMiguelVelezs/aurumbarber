// Carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Importar Firebase (si se usa como módulo)
import { db, collection, addDoc } from './firebase.js';

// Elementos del DOM
const carritoBtn = document.getElementById('carrito-btn');
const carritoModal = document.getElementById('carrito-modal');
const cerrarCarrito = document.getElementById('cerrar-carrito');
const carritoItems = document.getElementById('carrito-items');
const totalCarrito = document.getElementById('total-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
const finalizarCompraBtn = document.getElementById('finalizar-compra');

// Abrir/cerrar modal del carrito
carritoBtn?.addEventListener('click', () => {
    carritoModal.style.display = 'flex';
    mostrarCarrito();
});

cerrarCarrito?.addEventListener('click', () => {
    carritoModal.style.display = 'none';
});

// Cerrar al hacer clic fuera del modal
carritoModal?.addEventListener('click', (e) => {
    if (e.target === carritoModal) {
        carritoModal.style.display = 'none';
    }
});

// Agregar producto al carrito
function agregarAlCarrito(nombre, precio, imagen) {
    const productoExiste = carrito.find(item => item.nombre === nombre);
    
    if (productoExiste) {
        productoExiste.cantidad++;
    } else {
        carrito.push({
            nombre,
            precio,
            imagen,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarContador();
    mostrarNotificacion(`${nombre} agregado al carrito`);
}

// Eliminar producto del carrito
function eliminarDelCarrito(nombre) {
    carrito = carrito.filter(item => item.nombre !== nombre);
    guardarCarrito();
    actualizarContador();
    mostrarCarrito();
}

// Cambiar cantidad
function cambiarCantidad(nombre, operacion) {
    const producto = carrito.find(item => item.nombre === nombre);
    
    if (producto) {
        if (operacion === 'sumar') {
            producto.cantidad++;
        } else if (operacion === 'restar') {
            producto.cantidad--;
            if (producto.cantidad <= 0) {
                eliminarDelCarrito(nombre);
                return;
            }
        }
        guardarCarrito();
        mostrarCarrito();
    }
}

// Mostrar carrito
function mostrarCarrito() {
    if (!carritoItems) return;
    
    carritoItems.innerHTML = '';
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        totalCarrito.textContent = '$0';
        return;
    }
    
    carrito.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.dataset.index = index;
        itemDiv.dataset.nombre = item.nombre;
        itemDiv.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}">
            <div class="item-info">
                <h4>${item.nombre}</h4>
                <p class="item-precio">$${item.precio.toLocaleString()}</p>
            </div>
            <div class="item-cantidad">
                <button class="btn-cantidad btn-restar">-</button>
                <span>${item.cantidad}</span>
                <button class="btn-cantidad btn-sumar">+</button>
            </div>
            <button class="btn-eliminar">
                <i class='bx bx-trash'></i>
            </button>
        `;
        carritoItems.appendChild(itemDiv);
    });
    
    calcularTotal();
}

// Delegación de eventos para los botones del carrito
carritoItems?.addEventListener('click', (e) => {
    const item = e.target.closest('.carrito-item');
    if (!item) return;
    
    const nombre = item.dataset.nombre;
    
    // Botón eliminar
    if (e.target.closest('.btn-eliminar')) {
        eliminarDelCarrito(nombre);
        return;
    }
    
    // Botón sumar
    if (e.target.closest('.btn-sumar')) {
        cambiarCantidad(nombre, 'sumar');
        return;
    }
    
    // Botón restar
    if (e.target.closest('.btn-restar')) {
        cambiarCantidad(nombre, 'restar');
        return;
    }
});

// Calcular total
function calcularTotal() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (totalCarrito) {
        totalCarrito.textContent = `$${total.toLocaleString()}`;
    }
}

// Actualizar contador
function actualizarContador() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (contadorCarrito) {
        contadorCarrito.textContent = totalItems;
        contadorCarrito.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Guardar en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Vaciar carrito
vaciarCarritoBtn?.addEventListener('click', () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        actualizarContador();
        mostrarCarrito();
        mostrarNotificacion('Carrito vaciado');
    }
});

// Finalizar compra
finalizarCompraBtn?.addEventListener('click', async () => {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    // Pedir datos del cliente
    const nombre = prompt('Ingresa tu nombre:');
    if (!nombre) return;
    
    const telefono = prompt('Ingresa tu teléfono:');
    if (!telefono) return;
    
    const email = prompt('Ingresa tu email:');
    if (!email) return;
    
    try {
        // Guardar pedido en Firebase
        const pedido = {
            nombre,
            telefono,
            email,
            productos: carrito,
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            fecha: new Date().toISOString(),
            estado: 'pendiente'
        };
        
        await addDoc(collection(db, "pedidos"), pedido);
        
        alert(`¡Pedido realizado con éxito! Total: $${pedido.total.toLocaleString()}\n\nTe contactaremos pronto.`);
        
        // Limpiar carrito
        carrito = [];
        guardarCarrito();
        actualizarContador();
        mostrarCarrito();
        carritoModal.style.display = 'none';
    } catch (error) {
        console.error('Error al guardar el pedido:', error);
        alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    }
});

// Notificación
function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.className = 'notificacion-carrito';
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// Inicializar eventos de los botones "Ordenar"
document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    
    // Agregar evento a todos los botones de ordenar
    const botonesOrdenar = document.querySelectorAll('.btn');
    
    botonesOrdenar.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.drinks-items');
            const nombre = item.querySelector('.uno').textContent;
            const precioTexto = item.querySelector('.price').textContent;
            const precio = parseInt(precioTexto.replace(/\$|\.|\,/g, ''));
            const imagen = item.querySelector('img').src;
            
            agregarAlCarrito(nombre, precio, imagen);
        });
    });
});

import { db, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from "./firebase.js";

const tabla = document.querySelector("#tabla-reservas tbody");
const busqueda = document.getElementById("busqueda");
const agregarForm = document.getElementById("agregar-form");

// Barberos desde la base de datos
let barberos = [];

// Poblar select de barberos desde Firestore
async function poblarSelectBarberos(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Selecciona un barbero</option>';
  barberos = [];
  const querySnapshot = await getDocs(collection(db, "barberos"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    barberos.push({ id: docSnap.id, ...data });
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = data.nombre;
    select.appendChild(option);
  });
}

let reservas = [];
let reservasIds = [];

// Carga todas las reservas desde Firestore y las muestra en la tabla
async function cargarReservas() {
  tabla.innerHTML = "";
  reservas = [];
  reservasIds = [];
  const querySnapshot = await getDocs(collection(db, "reservas"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    reservas.push(data);
    reservasIds.push(docSnap.id);
  });
  mostrarReservas(reservas, reservasIds);
  actualizarDashboard(reservas);
}

// Muestra las reservas en la tabla HTML, con botones de editar y eliminar
function mostrarReservas(reservasFiltradas, idsFiltrados) {
  tabla.innerHTML = "";
  reservasFiltradas.forEach((data, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="campo" data-campo="nombre">${data.nombre}</span></td>
      <td><span class="campo" data-campo="telefono">${data.telefono}</span></td>
      <td><span class="campo" data-campo="email">${data.email}</span></td>
      <td><span class="campo" data-campo="fecha">${data.fecha}</span></td>
      <td><span class="campo" data-campo="hora">${data.hora}</span></td>
      <td><span class="campo" data-campo="servicios">${(data.servicios || []).join(', ')}</span></td>
      <td><span class="campo" data-campo="descripcion">${data.descripcion || ''}</span></td>
      <td><span class="campo" data-campo="barberoId" data-barbero="${data.barberoId || ''}">${data.barberoNombre || ''}</span></td>
      <td class="acciones">
        <button data-id="${idsFiltrados[i]}" class="editar-btn">Editar</button>
        <button data-id="${idsFiltrados[i]}" class="eliminar-btn">Eliminar</button>
      </td>
    `;
    tabla.appendChild(row);
  });
}

// Filtro de búsqueda en tiempo real (ahora también por barbero)
busqueda.addEventListener("input", () => {
  const texto = busqueda.value.toLowerCase();
  const filtradas = reservas
    .map((res, i) => ({ res, id: reservasIds[i] }))
    .filter(({ res }) =>
      res.nombre.toLowerCase().includes(texto) ||
      res.email.toLowerCase().includes(texto) ||
      res.telefono.toLowerCase().includes(texto) ||
      (res.barberoNombre || '').toLowerCase().includes(texto)
    );
  mostrarReservas(filtradas.map(f => f.res), filtradas.map(f => f.id));
});

// Maneja los botones de editar, guardar y eliminar
tabla.addEventListener("click", async (e) => {
  // Eliminar reserva
  if (e.target.classList.contains("eliminar-btn")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("¿Eliminar esta reserva?")) {
      await deleteDoc(doc(db, "reservas", id));
      await cargarReservas();
    }
  }

  // Editar reserva
  if (e.target.classList.contains("editar-btn")) {
    const row = e.target.closest("tr");
    row.querySelectorAll(".campo").forEach(span => {
      const campo = span.getAttribute("data-campo");
      let valor = span.textContent;
      if (campo === "servicios") {
        span.innerHTML = `<input type="text" value="${valor}">`;
      } else if (campo === "barberoId") {
        // Select de barberos desde la BD
        const select = document.createElement("select");
        barberos.forEach(barb => {
          const option = document.createElement("option");
          option.value = barb.id;
          option.textContent = barb.nombre;
          if (barb.id === span.getAttribute("data-barbero")) option.selected = true;
          select.appendChild(option);
        });
        span.innerHTML = "";
        span.appendChild(select);
      } else {
        span.innerHTML = `<input type="text" value="${valor}">`;
      }
    });
    e.target.style.display = "none";
    // Agrega botón guardar
    let guardarBtn = document.createElement("button");
    guardarBtn.textContent = "Guardar";
    guardarBtn.className = "guardar-btn";
    guardarBtn.setAttribute("data-id", e.target.getAttribute("data-id"));
    e.target.parentNode.insertBefore(guardarBtn, e.target.nextSibling);
  }

  // Guardar cambios
  if (e.target.classList.contains("guardar-btn")) {
    const id = e.target.getAttribute("data-id");
    const row = e.target.closest("tr");
    // Obtiene los nuevos valores
    const campos = {};
    let barberoId = "";
    let barberoNombre = "";
    for (const span of row.querySelectorAll(".campo")) {
      const campo = span.getAttribute("data-campo");
      if (campo === "barberoId") {
        const select = span.querySelector("select");
        barberoId = select.value;
        barberoNombre = select.options[select.selectedIndex].textContent;
        campos["barberoId"] = barberoId;
        campos["barberoNombre"] = barberoNombre;
      } else {
        let valor = span.querySelector("input").value;
        if (campo === "servicios") {
          campos[campo] = valor.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          campos[campo] = valor;
        }
      }
    }
    // Validar que no exista doble reserva para ese barbero/fecha/hora
    const existe = await existeReserva(barberoId, campos.fecha, campos.hora, id);
    if (existe) {
      alert("Ese barbero ya tiene una reserva en ese horario.");
      return;
    }
    // Actualiza en Firestore
    await updateDoc(doc(db, "reservas", id), campos);
    await cargarReservas();
  }
});

// Agrega una nueva reserva manualmente
agregarForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nuevo-nombre")?.value;
  const email = document.getElementById("nuevo-email")?.value;
  const telefono = document.getElementById("nuevo-telefono")?.value;
  const fecha = document.getElementById("nuevo-fecha")?.value;
  const hora = document.getElementById("nuevo-hora")?.value;
  const servicios = Array.from(document.querySelectorAll('.servicios-opciones input[type="checkbox"]:checked'))
    .map(cb => cb.value);
  const descripcion = document.getElementById("nuevo-descripcion")?.value;
  const barberoId = document.getElementById("nuevo-barbero")?.value;
  const barberoNombre = document.getElementById("nuevo-barbero")?.selectedOptions[0]?.textContent || "";

  // Validar campos obligatorios
  if (!nombre || !email || !telefono || !fecha || !hora || !barberoId) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  // Validar que no exista doble reserva para ese barbero/fecha/hora
  const existe = await existeReserva(barberoId, fecha, hora);
  if (existe) {
    alert("Ese barbero ya tiene una reserva en ese horario.");
    return;
  }

  await addDoc(collection(db, "reservas"), {
    nombre, email, telefono, fecha, hora, servicios, descripcion, barberoId, barberoNombre, timestamp: new Date()
  });
  agregarForm.reset();
  await cargarReservas();
});

// Mostrar/ocultar el formulario de agregar reserva
const mostrarFormBtn = document.getElementById("mostrar-form-btn");

mostrarFormBtn.addEventListener("click", () => {
  if (agregarForm.style.display === "none") {
    // Ocultar la sección de barberos antes de mostrar el formulario de reservas
    seccionBarberos.style.display = "none";
    mostrarBarberoBtn.textContent = "Agregar Barbero";
    
    agregarForm.style.display = "block";
    mostrarFormBtn.textContent = "Ocultar Formulario";
  } else {
    agregarForm.style.display = "none";
    mostrarFormBtn.textContent = "Agregar Reserva";
  }
});

// Mostrar/ocultar la sección de barberos
const mostrarBarberoBtn = document.getElementById("mostrar-barbero-btn");
const seccionBarberos = document.getElementById("seccion-barberos");

mostrarBarberoBtn.addEventListener("click", () => {
  if (seccionBarberos.style.display === "none" || !seccionBarberos.style.display) {
    // Ocultar el formulario de reservas antes de mostrar la sección de barberos
    agregarForm.style.display = "none";
    mostrarFormBtn.textContent = "Agregar Reserva";
    
    seccionBarberos.style.display = "block";
    mostrarBarberoBtn.textContent = "Ocultar Barberos";
  } else {
    seccionBarberos.style.display = "none";
    mostrarBarberoBtn.textContent = "Agregar Barbero";
  }
});






// Función para actualizar el dashboard
function actualizarDashboard(reservas) {
    document.getElementById('total-reservas').textContent = reservas.length;
    const hoy = new Date().toISOString().slice(0, 10);
    const reservasHoy = reservas.filter(r => r.fecha === hoy);
    document.getElementById('reservas-hoy').textContent = reservasHoy.length;
    const clientesUnicos = new Set(reservas.map(r => r.email));
    document.getElementById('clientes-unicos').textContent = clientesUnicos.size;
    const serviciosContador = {};
    reservas.forEach(r => {
        if (Array.isArray(r.servicios)) {
            r.servicios.forEach(servicio => {
                const s = servicio.trim();
                if (s) serviciosContador[s] = (serviciosContador[s] || 0) + 1;
            });
        }
    });
    let popular = '-';
    let max = 0;
    for (const [servicio, count] of Object.entries(serviciosContador)) {
        if (count > max) {
            popular = servicio;
            max = count;
        }
    }
    document.getElementById('servicio-popular').textContent = popular;
}

// Verifica si ya existe una reserva para ese barbero/fecha/hora (excepto el id actual si se edita)
async function existeReserva(barberoId, fecha, hora, excludeId = null) {
  const q = query(
    collection(db, "reservas"),
    where("barberoId", "==", barberoId),
    where("fecha", "==", fecha),
    where("hora", "==", hora)
  );
  const snap = await getDocs(q);
  let existe = false;
  snap.forEach(docSnap => {
    if (!excludeId || docSnap.id !== excludeId) {
      existe = true;
    }
  });
  return existe;
}

// --- BARBEROS CRUD ---

const formBarbero = document.getElementById("form-barbero");
const tablaBarberos = document.getElementById("tabla-barberos");

// Cargar y mostrar barberos en la tabla
async function cargarBarberosTabla() {
  if (!tablaBarberos) return;
  tablaBarberos.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "barberos"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nombre}</td>
      <td>${data.edad}</td>
      <td>${data.numero}</td>
      <td>${data.cedula}</td>
      <td>${data.nacimiento}</td>
      <td>${data.email}</td>
      <td>${data.direccion}</td>
      <td>
        <button class="editar-barbero-btn" data-id="${docSnap.id}">Editar</button>
        <button class="eliminar-barbero-btn" data-id="${docSnap.id}">Eliminar</button>
      </td>
    `;
    tablaBarberos.appendChild(tr);
  });
}

// Validar barbero duplicado por cédula o email
async function existeBarbero(cedula, email, excludeId = null) {
  const q = query(
    collection(db, "barberos"),
    where("cedula", "==", cedula)
  );
  const q2 = query(
    collection(db, "barberos"),
    where("email", "==", email)
  );
  const snap1 = await getDocs(q);
  const snap2 = await getDocs(q2);
  let existe = false;
  snap1.forEach(docSnap => {
    if (!excludeId || docSnap.id !== excludeId) existe = true;
  });
  snap2.forEach(docSnap => {
    if (!excludeId || docSnap.id !== excludeId) existe = true;
  });
  return existe;
}

// Guardar barbero en Firestore (nuevo o edición)
formBarbero.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("barbero-nombre").value.trim();
  const edad = document.getElementById("barbero-edad").value.trim();
  const numero = document.getElementById("barbero-numero").value.trim();
  const cedula = document.getElementById("barbero-cedula").value.trim();
  const nacimiento = document.getElementById("barbero-nacimiento").value.trim();
  const email = document.getElementById("barbero-email").value.trim();
  const direccion = document.getElementById("barbero-direccion").value.trim();

  if (!nombre || !edad || !numero || !cedula || !nacimiento || !email || !direccion) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  // Si estamos editando, el id estará en el form dataset
  const editId = formBarbero.dataset.editando;
  if (editId) {
    if (await existeBarbero(cedula, email, editId)) {
      alert("Ya existe un barbero con esa cédula o email.");
      return;
    }
    await updateDoc(doc(db, "barberos", editId), {
      nombre, edad, numero, cedula, nacimiento, email, direccion
    });
    delete formBarbero.dataset.editando;
    alert("Barbero actualizado correctamente.");
  } else {
    if (await existeBarbero(cedula, email)) {
      alert("Ya existe un barbero con esa cédula o email.");
      return;
    }
    await addDoc(collection(db, "barberos"), {
      nombre, edad, numero, cedula, nacimiento, email, direccion
    });
    alert("Barbero registrado correctamente.");
  }

  formBarbero.reset();
  await poblarSelectBarberos("nuevo-barbero");
  await cargarBarberosTabla();
});

// Editar y eliminar barbero desde la tabla
tablaBarberos?.addEventListener("click", async (e) => {
  const id = e.target.getAttribute("data-id");
  if (e.target.classList.contains("eliminar-barbero-btn")) {
    if (confirm("¿Eliminar este barbero?")) {
      await deleteDoc(doc(db, "barberos", id));
      await poblarSelectBarberos("nuevo-barbero");
      await cargarBarberosTabla();
    }
  }
  if (e.target.classList.contains("editar-barbero-btn")) {
    // Obtener datos actuales
    const q = query(collection(db, "barberos"), where("__name__", "==", id));
    const docSnap = await getDocs(q);
    let data;
    docSnap.forEach(d => data = d.data());
    if (!data) return;
    // Rellenar el formulario
    document.getElementById("barbero-nombre").value = data.nombre;
    document.getElementById("barbero-edad").value = data.edad;
    document.getElementById("barbero-numero").value = data.numero;
    document.getElementById("barbero-cedula").value = data.cedula;
    document.getElementById("barbero-nacimiento").value = data.nacimiento;
    document.getElementById("barbero-email").value = data.email;
    document.getElementById("barbero-direccion").value = data.direccion;
    formBarbero.dataset.editando = id;
    seccionBarberos.style.display = "block";
    mostrarBarberoBtn.textContent = "Ocultar Barberos";
  }
});

// Inicializa el select de barberos y reservas al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await poblarSelectBarberos("nuevo-barbero");
  await cargarReservas();
  await cargarBarberosTabla();
});
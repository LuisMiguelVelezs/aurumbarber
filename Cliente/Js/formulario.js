import { db, collection, addDoc } from "./firebase.js";

document.getElementById("form-unificado").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const descripcion = document.getElementById("descripcion").value;
  const servicios = Array.from(document.querySelectorAll('input[name="servicios"]:checked')).map(el => el.value);

  try {
    await addDoc(collection(db, "reservas"), {
      nombre,
      email,
      telefono,
      fecha,
      hora,
      servicios,
      descripcion,
      timestamp: new Date()
    });

    document.getElementById("mensaje-confirmacion").style.display = "block"; 
    this.reset();
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    alert("Error al guardar la reserva. Revisa la consola.");
  }
});
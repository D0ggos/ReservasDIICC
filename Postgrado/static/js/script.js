const container = document.querySelector(".container");
const asientos = document.querySelectorAll(".container .asiento");
const diaSeleccionado = document.getElementById("dia");
var idAsientoSeleccionado = null;


// Obtiene la fecha actual
let fechaActual = new Date();

// Obtiene los elementos de las opciones del menú desplegable
const lunes = document.getElementById("lunes");
const martes = document.getElementById("martes");
const miercoles = document.getElementById("miercoles");
const jueves = document.getElementById("jueves");
const viernes = document.getElementById("viernes");

// Calcula las fechas de los próximos días
let fechaLunes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + (1 - fechaActual.getDay() + 7) % 7);
let fechaMartes = new Date(fechaLunes.getFullYear(), fechaLunes.getMonth(), fechaLunes.getDate() + 1);
let fechaMiercoles = new Date(fechaMartes.getFullYear(), fechaMartes.getMonth(), fechaMartes.getDate() + 1);
let fechaJueves = new Date(fechaMiercoles.getFullYear(), fechaMiercoles.getMonth(), fechaMiercoles.getDate() + 1);
let fechaViernes = new Date(fechaJueves.getFullYear(), fechaJueves.getMonth(), fechaJueves.getDate() + 1);

// Actualiza las opciones del menú desplegable con las fechas
lunes.textContent = "Lunes " + fechaLunes.toLocaleDateString();
martes.textContent = "Martes " + fechaMartes.toLocaleDateString();
miercoles.textContent = "Miércoles " + fechaMiercoles.toLocaleDateString();
jueves.textContent = "Jueves " + fechaJueves.toLocaleDateString();
viernes.textContent = "Viernes " + fechaViernes.toLocaleDateString();

// Itera sobre cada asiento
asientos.forEach((asiento, index) => {
  // Crea un elemento span para contener el número del asiento
  let numeroAsiento = document.createElement('span');
  numeroAsiento.className = 'numero-asiento';

  // Asigna el número del asiento (index + 1 porque los arrays empiezan en 0)
  numeroAsiento.textContent = asientos.length - index;

  // Añade el número del asiento al asiento
  asiento.appendChild(numeroAsiento);
});


// Dia actual. Pasarlo a la base de datos al momento de reservar. Debe actualizarse.
let diaActual = diaSeleccionado.value;
let fechaSeleccionada = new Date(diaActual);

// Evento de cambio en la selección de día
diaSeleccionado.addEventListener("change", (e) => {

  const asientosSeleccionados = document.querySelectorAll(".row .asiento.reservado");
  asientosSeleccionados.forEach((asiento) => {
    asiento.classList.remove("reservado");
  });
  idAsientoSeleccionado = null;

  diaActual = e.target.value;

  const partesFecha = diaActual.split(' ')[1].split('/');
  fechaSeleccionada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`; // Formato YYYY-MM-DD
  console.log(diaActual);

asientos.forEach((asiento) => {
    asiento.classList.remove("seleccionado");
    actualizarAsientosSeleccionados();
  });

  // Haz una solicitud GET a la ruta /reservations/<date>
  fetch(`/reservations/${fechaSeleccionada}`)
    .then(response => response.json())
    .then(reservas => {
    // Por cada puesto reservado, agrega la clase 'reservado' al elemento correspondiente
    reservas.forEach(puesto => {
      let asiento = document.getElementById(`${puesto}`);
      asiento.classList.add('reservado');
    });
  });
});

// Evento de clic en el asiento
container.addEventListener("click", (e) => {

  // Verifica si el elemento clickeado es un asiento y no está reservado
  if (e.target.classList.contains("asiento") && !e.target.classList.contains("reservado")) {
    
    const asientoSeleccionado = e.target;

    // Verifica si el asiento ya está seleccionado
    const isSelected = asientoSeleccionado.classList.contains("seleccionado");
    

    // Obtiene todos los asientos seleccionados
    const asientosSeleccionados = document.querySelectorAll(".row .asiento.seleccionado");

    // Si el asiento no está seleccionado y ya hay un asiento seleccionado
    if (!isSelected && asientosSeleccionados.length > 0) {
      // Desmarca todos los asientos seleccionados
      asientosSeleccionados.forEach((asiento) => {
        asiento.classList.remove("seleccionado");
      });
    }

    // Marca o desmarca el asiento seleccionado
    asientoSeleccionado.classList.toggle("seleccionado");

    // Si el asiento está seleccionado, asigna su id a idAsientoSeleccionado, de lo contrario, asigna null
    idAsientoSeleccionado = asientoSeleccionado.classList.contains("seleccionado") ? asientoSeleccionado.id : null;
    console.log(idAsientoSeleccionado);

    // Actualiza la lista de asientos seleccionados
    actualizarAsientosSeleccionados();
  }
});

function actualizarAsientosSeleccionados() {
  const asientosSeleccionados = document.querySelectorAll(".row .asiento.seleccionado");

  // Si hay más de un asiento seleccionado, deselecciona todos excepto el último seleccionado
  if (asientosSeleccionados.length > 1) {
    asientosSeleccionados.forEach((asiento, index) => {
      if (index < asientosSeleccionados.length - 1) {
        asiento.classList.remove("seleccionado");
      }
    });
  }

  // Actualiza la lista de asientos seleccionados
  const asientosSeleccionadosUpdated = document.querySelectorAll(".row .asiento.seleccionado");
  const asientosIndex = [...asientosSeleccionadosUpdated].map((asiento) => [...asientos].indexOf(asiento));

  localStorage.setItem("asientosSeleccionados", JSON.stringify(asientosIndex));
}
document.querySelector("#reservar").addEventListener("click", () => {
  const puesto = idAsientoSeleccionado; 
  const fecha_agendamiento = fechaSeleccionada;

  if (!puesto || !fecha_agendamiento) {
    console.error('Faltan datos para la reserva');
    return;
  }

  fetch('/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      puesto: puesto,
      fecha_agendamiento: fecha_agendamiento,
      fecha: diaActual,
    }),
  })
  .then(response => {
    if (response.redirected) {
      window.location.href = response.url;
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});



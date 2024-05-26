const container = document.querySelector(".container");
const asientos = document.querySelectorAll(".container .asiento");
const diaSeleccionado = document.getElementById("dia");
const horarioSeleccionado = document.getElementById("horario");
var idAsientoSeleccionado = null;
const info = document.querySelector(".info");
var cond = false;
let hoy1 = null;

// Obtiene la fecha actual
let fechaActual = new Date();

let hoy = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());

// Calcula las fechas de los días de la semana actual
let fechaLunesActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() - fechaActual.getDay() + 1);
let fechaMartesActual = new Date(fechaLunesActual.getFullYear(), fechaLunesActual.getMonth(), fechaLunesActual.getDate() + 1);
let fechaMiercolesActual = new Date(fechaMartesActual.getFullYear(), fechaMartesActual.getMonth(), fechaMartesActual.getDate() + 1);
let fechaJuevesActual = new Date(fechaMiercolesActual.getFullYear(), fechaMiercolesActual.getMonth(), fechaMiercolesActual.getDate() + 1);
let fechaViernesActual = new Date(fechaJuevesActual.getFullYear(), fechaJuevesActual.getMonth(), fechaJuevesActual.getDate() + 1);

// Calcula las fechas de los días de la semana siguiente
let fechaLunesSiguiente = new Date(fechaLunesActual.getFullYear(), fechaLunesActual.getMonth(), fechaLunesActual.getDate() + 7);
let fechaMartesSiguiente = new Date(fechaLunesSiguiente.getFullYear(), fechaLunesSiguiente.getMonth(), fechaLunesSiguiente.getDate() + 1);
let fechaMiercolesSiguiente = new Date(fechaMartesSiguiente.getFullYear(), fechaMartesSiguiente.getMonth(), fechaMartesSiguiente.getDate() + 1);
let fechaJuevesSiguiente = new Date(fechaMiercolesSiguiente.getFullYear(), fechaMiercolesSiguiente.getMonth(), fechaMiercolesSiguiente.getDate() + 1);
let fechaViernesSiguiente = new Date(fechaJuevesSiguiente.getFullYear(), fechaJuevesSiguiente.getMonth(), fechaJuevesSiguiente.getDate() + 1);

// Función para agregar opción si la fecha no ha pasado
function agregarOpcion(fecha, elemento, texto) {
  if (fecha >= hoy) {
    if (cond == false) {
      hoy1 = fecha;
      cond = true;
    }
    let opcion = document.createElement("option");
    opcion.textContent = texto + " " + fecha.toLocaleDateString();
    elemento.appendChild(opcion);
  }
}

// Actualiza las opciones del menú desplegable con las fechas
let selectDia = document.getElementById("dia");

agregarOpcion(fechaLunesActual, selectDia, "Lunes");
agregarOpcion(fechaMartesActual, selectDia, "Martes");
agregarOpcion(fechaMiercolesActual, selectDia, "Miércoles");
agregarOpcion(fechaJuevesActual, selectDia, "Jueves");
agregarOpcion(fechaViernesActual, selectDia, "Viernes");
agregarOpcion(fechaLunesSiguiente, selectDia, "Lunes");
agregarOpcion(fechaMartesSiguiente, selectDia, "Martes");
agregarOpcion(fechaMiercolesSiguiente, selectDia, "Miércoles");
agregarOpcion(fechaJuevesSiguiente, selectDia, "Jueves");
agregarOpcion(fechaViernesSiguiente, selectDia, "Viernes");

let selectHorario = document.getElementById("horario");
let horario_mañana = document.createElement("option");
horario_mañana.textContent = "Mañana (08:00 - 14:00)";
let horario_tarde = document.createElement("option");
horario_tarde.textContent = "Tarde (14:00 - 20:00)";
selectHorario.appendChild(horario_mañana);
selectHorario.appendChild(horario_tarde);


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
let horarioActual = "Mañana";


document.addEventListener("DOMContentLoaded", () => {
  const partesHoy = hoy1.toLocaleDateString().split('/');
  fechaSeleccionada = `${partesHoy[2]}-${partesHoy[1]}-${partesHoy[0]}`; // Formato YYYY-MM-DD


  fetch(`/reservations/${fechaSeleccionada}`, {  
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      horario: horarioActual,
  }),
})
  
  .then(response => response.json())
  .then(reservas => {
    reservas.forEach(puesto => {
      let asiento = document.getElementById(`${puesto}`);
      asiento.classList.add('reservado');
      });
    });
});

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

  fetch(`/reservations/${fechaSeleccionada}`, {  
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      horario: horarioActual,
  }),
})
  
  .then(response => response.json())
  .then(reservas => {
    reservas.forEach(puesto => {
      let asiento = document.getElementById(`${puesto}`);
      asiento.classList.add('reservado');
      });
    });
});



// Evento de cambio en la selección de horario
horarioSeleccionado.addEventListener("change", (e) => {

  const asientosSeleccionados = document.querySelectorAll(".row .asiento.reservado");
  asientosSeleccionados.forEach((asiento) => {
    asiento.classList.remove("reservado");
  });
  idAsientoSeleccionado = null;

  horarioActual = e.target.value.split(' ')[0];
  console.log(horarioActual);

asientos.forEach((asiento) => {
    asiento.classList.remove("seleccionado");
    actualizarAsientosSeleccionados();
  });

  fetch(`/reservations/${fechaSeleccionada}`, {  
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      horario: horarioActual,
  }),
})
  
  .then(response => response.json())
  .then(reservas => {
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
  const horarioSeleccionado = horarioActual;
  console.log(puesto, fecha_agendamiento, horarioSeleccionado)

  if (!puesto || !fecha_agendamiento) {
    alert('Por favor selecciona un asiento y una fecha')
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
      horario: horarioSeleccionado,
    }),
  })
  .then(response => {
    if (response.ok) {
      alert('Reserva realizada con éxito');
      location.assign('/login');
    } else {
      return response.json().then(data => {
        if (data.message) {
          alert(data.message);
        }
      });
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});


fetch('/reservas_usuario', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    date: hoy,
  }),
})

.then(response => response.json())
.then(data => {

  data.forEach(reserva => {
    let fecha = reserva[0].split(' ')[1] + ' ' + reserva[0].split(' ')[2] + ' ' + reserva[0].split(' ')[3];
    reserva[0] = new Date(fecha);
    reserva[0] =  reserva[0].toLocaleDateString();
    reserva[0] = reserva[0].split('/').reverse().join('-');
  });

  data.forEach(reserva => {
    let fechaReserva = document.createElement('p');
    fechaReserva.className = 'boton-reservas'
    fechaReserva.textContent = 'Puesto ' + reserva[1] + '  para el dia ' + reserva[0] + ' en la ' + reserva[2];
    info.appendChild(fechaReserva);
  });
})
.catch(error => {
  console.error('Error:', error);
});



info.addEventListener('click', (e) => {
  if (e.target.classList.contains('boton-reservas')) {
    let confirmacion = confirm('¿Estás seguro/a de que deseas cancelar esta reserva?');
    if (confirmacion) {
      let text = e.target.textContent;
      let fecha = text.split(' ')[6];
      console.log(fecha);
      let puesto = text.split(' ')[1];
      let horario = text.split('en la ')[1];

      fetch('/eliminar_reserva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: fecha,
          puesto: puesto,
          horario: horario,
        }),
      })
      .then(response => response.json())
      .then (data => {
            if (data.message) {
              alert(data.message);
              location.reload();
            }
          })
      .catch((error) => {
        console.error('Error:', error);
      })
    }
  }});


const container = document.querySelector(".container");
const contenedor2 = document.querySelector(".contenedor-principal_2");
const asientos = document.querySelectorAll(".container .asiento");
const info = document.querySelector("#reservas-x-asiento");
const usuarios_container = document.querySelector(".usuarios-container");
const calendario = document.querySelector(".calendario-asientos-container")
const vitaliciosContainer = document.querySelector('.vitalicios-container');
let asientoSeleccionado = null;
let puestosVitalicios = null;



fetch('/puestos_vitalicios', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
.then(response => response.json())
.then(data => {
  puestosVitalicios = data;
  console.log(puestosVitalicios);
  for (let i = 0; i < data.length; i++) {

    let vitalicioElement = document.createElement('div');
    vitalicioElement.className = 'eliminar_vitalicio_button';
    vitalicioElement.textContent = 'Puesto ' + data[i][0] + ' de ' + data[i][1];
    vitaliciosContainer.appendChild(vitalicioElement);
  }
})
.catch(error => {
  console.error('Error:', error);
});


vitaliciosContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains('eliminar_vitalicio_button')) {
    const confirmacion = confirm('¿Seguro que quieres eliminar este puesto vitalicio?');
    if (confirmacion) {
      const puestoSeleccionado = e.target;
      const puesto = puestoSeleccionado.textContent.split(' ')[1];
      fetch('/eliminar_vitalicio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puesto: puesto,
        }),
      })
        .then(response =>  {
        if (response.ok) {
          alert('Puesto vitalicio eliminado correctamente');
          location.reload();
        }
      })
        .catch(error => {
          alert('Error al eliminar el puesto vitalicio');
        });
    }
  }
});


// Obtiene la fecha actual
let fechaActual = new Date();

let diaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
diaActual =  diaActual.toLocaleDateString();
diaActual = diaActual.split('/').reverse().join('-');


asientos.forEach((asiento, index) => {
  let numeroAsiento = document.createElement('span');
  numeroAsiento.className = 'numero-asiento';

  numeroAsiento.textContent = asientos.length - index;
  asiento.appendChild(numeroAsiento);
});



container.addEventListener("click", (e) => {

    while (info.firstChild) {
      info.removeChild(info.firstChild);
    }
    asientoSeleccionado = e.target;
    const isSelected = asientoSeleccionado.classList.contains("seleccionado");
    const asientosSeleccionados = document.querySelectorAll(".row .asiento.seleccionado");
    if (!isSelected && asientosSeleccionados.length > 0) {
      asientosSeleccionados.forEach((asiento) => {
        asiento.classList.remove("seleccionado");
      });
    }
    asientoSeleccionado.classList.toggle("seleccionado");
    idAsientoSeleccionado = asientoSeleccionado.classList.contains("seleccionado") ? asientoSeleccionado.id : null;

    fetch('/calendario-asientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asiento: idAsientoSeleccionado,
          date: diaActual,
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
        let contenedorReservas = document.getElementById('reservas-x-asiento');
        data.forEach(reserva => {
          let fechaReserva = document.createElement('p');
          fechaReserva.id = reserva[3];
          fechaReserva.className = "boton-reservas";
          fechaReserva.textContent = reserva[1] + '  -  ' + reserva[0] + ' en la ' + reserva[2];
          contenedorReservas.appendChild(fechaReserva);
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
});



calendario.addEventListener('click', (e) => {
  if (e.target.classList.contains('boton-reservas')) {
    let confirmacion = confirm('¿Estás seguro de que deseas cancelar esta reserva?');
    if (confirmacion) {
      let idReserva = e.target.id;

      fetch('/eliminar_reserva_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: idReserva,
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



fetch('/asientos_hoy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    date: diaActual,
  }),
})

.then(response => response.json())
.then(data => {
  let hoy = document.querySelector('.asientos-hoy-container');

  for (let i = 0; i < data.length; i += 2) {
    let pairContainer = document.createElement('div');
    pairContainer.className = 'pair-container';

    let reserva1 = document.createElement('p');
    reserva1.textContent = data[i][0] + '  puesto ' + data[i][1] + ' en la ' + data[i][2];
    pairContainer.appendChild(reserva1);

    if (data[i + 1]) {
      let reserva2 = document.createElement('p');
      reserva2.textContent = data[i + 1][0] + ' puesto ' + data[i + 1][1] + ' en la ' + data[i + 1][2];
      pairContainer.appendChild(reserva2);
    }

    hoy.appendChild(pairContainer);
  }
})
.catch(error => {
  console.error('Error:', error);
});

// Mostrar todos los usuario del sistema
fetch('/usuarios', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => response.json())
.then(data => {
  let usuariosContainer = document.querySelector('.usuarios-container');

  for (let i = 0; i < data.length; i += 6) {
    let column = document.createElement('div');
    column.className = 'column';

    for (let j = i; j < i + 6 && j < data.length; j++) {
      let usuarioElement = document.createElement('div');
      usuarioElement.className = 'eliminar-usuario-button';
      usuarioElement.textContent = data[j];
      column.appendChild(usuarioElement);
    }

    usuariosContainer.appendChild(column);
  }
})



usuarios_container.addEventListener("click", (e) => {
  if (e.target.classList.contains('eliminar-usuario-button')) {
    const confirmacion = confirm('¿Seguro que quieres eliminar este usuario?');
    if (confirmacion) {
      const usuarioSeleccionado = e.target;
      const usuario = usuarioSeleccionado.textContent.split(' - ')[0];
      console.log(usuario);
      fetch('/eliminar_usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usuario,
        }),
      })
        .then(response =>  {
        if (response.ok) {
          alert('Usuario eliminado correctamente');
          location.reload();
        }
      })
        .catch(error => {
          alert('Error al eliminar el usuario');
        });
    }
  }
});


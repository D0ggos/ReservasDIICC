const container = document.querySelector(".container");
const asientos = document.querySelectorAll(".container .asiento");
const info = document.querySelector("#reservas-x-asiento");
const usuarios_container = document.querySelector(".usuarios-container");
const calendario = document.querySelector(".calendario-asientos-container")
let asientoSeleccionado = null;

// Obtiene la fecha actual
let fechaActual = new Date();

let diaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
diaActual =  diaActual.toLocaleDateString();
diaActual = diaActual.split('/').reverse().join('-');

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


// Evento de clic en el asiento
container.addEventListener("click", (e) => {

    while (info.firstChild) {
      info.removeChild(info.firstChild);
    }
    asientoSeleccionado = e.target;
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

        data.forEach(reserva => {
          let fechaReserva = document.createElement('p');
          fechaReserva.className = "boton-reservas";
          fechaReserva.textContent = reserva[1] + '  -  ' + reserva[0];
          info.appendChild(fechaReserva);
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
      let text = e.target.textContent;

      let fecha = text.split('-')[1] + '-' + text.split('-')[2] + '-' + text.split('-')[3];
      fecha = fecha.split(' ')[2];

      let nombre = text.split('-')[0];
      nombre = nombre.split(' ')[0] + ' ' + nombre.split(' ')[1] + ' ' + nombre.split(' ')[2] + ' ' + nombre.split(' ')[3];
      
      idAsientoSeleccionado = asientoSeleccionado.classList.contains("seleccionado") ? asientoSeleccionado.id : null;

      fetch('/eliminar_reserva_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: fecha,
          nombre: nombre,
          puesto: idAsientoSeleccionado
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
  let hoy = document.querySelector('.asientos-hoy-container'); // Asegúrate de seleccionar el contenedor correcto

  for (let i = 0; i < data.length; i += 2) {
    let pairContainer = document.createElement('div');
    pairContainer.className = 'pair-container';

    let reserva1 = document.createElement('p');
    reserva1.textContent = data[i][0] + '  puesto ' + data[i][1];
    pairContainer.appendChild(reserva1);

    if (data[i + 1]) {
      let reserva2 = document.createElement('p');
      reserva2.textContent = data[i + 1][0] + ' puesto ' + data[i + 1][1];
      pairContainer.appendChild(reserva2);
    }

    hoy.appendChild(pairContainer); // Agrega el contenedor al elemento 'hoy'
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
  let usuariosContainer = document.querySelector('.usuarios-container'); // Asegúrate de  el contenedor correcto

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


// Función para eliminar una reserva
function eliminarReserva(idReserva) {
  fetch('/eliminar-reserva', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: idReserva,
    }),
  })
    .then(response => response.json())
    .then(data => {
      // Realizar acciones después de eliminar la reserva
      console.log('Reserva eliminada:', data);
    })
    .catch(error => {
      console.error('Error al eliminar la reserva:', error);
    });
}

// Ejemplo de uso: eliminar la reserva con ID 123

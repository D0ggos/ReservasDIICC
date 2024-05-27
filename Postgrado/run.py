from flask import Flask, render_template, url_for, redirect, jsonify, request, session
import psycopg2
from psycopg2 import Error
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta

conexion = psycopg2.connect(
    host = "localhost",
    database = "pruebas",
    user = "admin",
    password = "P.Q-37sop"
)

app = Flask(__name__)
app.secret_key = "owo"

fecha = None

def crear_mauri():
    cursor = conexion.cursor()
    cursor.execute('INSERT INTO login (usuario, contraseña, nombre, tipo) VALUES (%s, %s, %s, %s)', ('mauri', generate_password_hash('1234'), 'Mauricio Echavarría', 'admin',))
    conexion.commit()
    return

@app.route("/create_user", methods = ["GET", "POST"])
def create_user():
    if request.method == 'POST':
        user = request.form['usuario']
        password = request.form['contraseña']
        password2 = request.form['confirmar-contraseña']
        name = request.form['nombre']

        if password != password2:
            return render_template('dashboard.html', error1='Las contraseñas no coinciden')

        pass_encriptada = generate_password_hash(password2)
        cursor = conexion.cursor()
        cursor.execute('SELECT usuario FROM login WHERE usuario = %s', (user,))
        if cursor.fetchone() is not None:
            return render_template('dashboard.html', error1='El usuario ya existe')
        elif name == '':
            return render_template('dashboard.html', error1='Ingresa un nombre válido')
        
        cursor.execute('INSERT INTO login (usuario, contraseña, nombre, tipo) VALUES (%s, %s, %s, %s)', (user, pass_encriptada, name, 'Estudiante',))
        conexion.commit()
        return render_template('dashboard.html', message1='Usuario creado correctamente')
    return redirect(url_for('dashboard'))



@app.route("/change_password", methods = ["GET", "POST"])
def change_password():
    if request.method == 'POST':
        user = request.form['usuario']
        password = request.form['contraseña']
        password2 = request.form['confirmar-contraseña']

        if password != password2:
            return render_template('dashboard.html', error2='Las contraseñas no coinciden')
        
        cursor = conexion.cursor()
        cursor.execute('SELECT nombre FROM login WHERE usuario = %s', (user,))
        if cursor.fetchone() is None:
            return render_template('dashboard.html', error2='El usuario no existe')

        pass_encriptada = generate_password_hash(password2)
        cursor.execute('UPDATE login SET contraseña = %s WHERE usuario = %s', (pass_encriptada, user,))
        conexion.commit()
        return render_template('dashboard.html', message2='Contraseña cambiada correctamente')
    return redirect(url_for('dashboard'))



@app.route("/usuarios", methods = ["GET", "POST"])
def usuarios():
    cursor = conexion.cursor()
    cursor.execute('SELECT usuario FROM login')
    usuarios = [row[0] for row in cursor.fetchall()]
    return jsonify(usuarios)



@app.route("/eliminar_usuario", methods = ["GET", "POST"])
def eliminar_usuario():
    if request.method == 'POST':
        data = request.get_json()
        usuario = data.get('usuario')
        print(usuario)
        cursor = conexion.cursor()
        cursor.execute('DELETE FROM login WHERE usuario = %s', (usuario,))
        conexion.commit()
        return jsonify({'message': 'Usuario eliminado correctamente'})

    return redirect(url_for('dashboard'))



@app.route("/login", methods = ["GET", "POST"])
def login():
    error = None
    session.pop('username', None)
    if request.method == 'POST':
        username = request.form['username']
        usuario = username
        password = request.form['password']
        
        cursor = conexion.cursor()
        cursor.execute('SELECT contraseña FROM login WHERE usuario = %s', (username,))
        hashed_password = cursor.fetchone()
        
        if hashed_password is None or not check_password_hash(hashed_password[0], password):
            error = 'Nombre de usuario o contraseña incorrectos'
            return render_template('login.html', error=error)
        else:
            session['username'] = username
            return redirect(url_for('reserva'))
        
    return render_template("login.html", error=error)



@app.route("/admin", methods = ["GET", "POST"])
def admin():
    error = None
    session.pop('username', None)
    if request.method == 'POST':
        username = request.form['username']
        usuario = username
        password = request.form['password']
        
        cursor = conexion.cursor()
        cursor.execute('SELECT contraseña FROM login WHERE usuario = %s AND tipo = %s', (username, 'admin'))
        hashed_password = cursor.fetchone()
        
        if hashed_password is None or not check_password_hash(hashed_password[0], password):
            error = 'Nombre de usuario o contraseña incorrectos'
            return render_template('admin.html', error=error)
        else:
            session['username'] = username
            return redirect(url_for('dashboard'))
    return render_template("admin.html")



@app.route("/dashboard", methods = ["GET", "POST"])
def dashboard():
    if request.referrer is None:
        return redirect(url_for('admin'))
    return render_template("dashboard.html")

@app.route("/calendario-asientos", methods = ["GET", "POST"])
def calendario_asientos():
    cursor = conexion.cursor()
    data = request.get_json()
    asiento = data.get('asiento')
    date = data.get('date')
    # seleccionar todas las fechas siguientes que tiene agendado el asiento
    try:
        cursor.execute('SELECT fecha_agendamiento, nombre, horario FROM reservas WHERE puesto = %s AND fecha_agendamiento > %s', (asiento, date))
        fechas_siguientes = [(row[0], row[1], row[2]) for row in cursor.fetchall()]
    except Error as e:
        conexion.rollback()
        fechas_siguientes = []
    finally:
        cursor.close()
    return jsonify(fechas_siguientes)


@app.route("/puestos_vitalicios", methods = ["GET", "POST"])
def puestos_vitalicios():
    if request.referrer is None:
        return redirect(url_for('admin'))
    if request.method == 'GET':
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            cursor = conexion.cursor()
            cursor.execute('SELECT puesto, nombre FROM reservas WHERE horario = %s', ('Vitalicio',))
            puestos_vitalicios = [(row[0], row[1]) for row in cursor.fetchall()]
            return jsonify(puestos_vitalicios)
        else:
            return redirect(url_for('dashboard'))

    if request.method == 'POST':
        puestos = ['1','2','3','4','5','6','7','8','9','10']
        usuario = request.form['usuario']
        puesto = request.form['puesto']
        if puesto not in puestos:
            return render_template('dashboard.html', error3='Selecciona un puesto válido')

        cursor = conexion.cursor()
        cursor.execute('SELECT nombre FROM login WHERE usuario = %s', (usuario,))
        nombre = cursor.fetchone()
        if nombre is None:
            return render_template('dashboard.html', error3='El usuario no existe')
        nombre = nombre[0]

        cursor.execute('SELECT COUNT(*) FROM reservas WHERE puesto = %s AND horario = %s', (puesto, 'Vitalicio',))
        if cursor.fetchone()[0] > 0:
            return render_template('dashboard.html', error3='El puesto ya está ocupado')
        
        cursor.execute('INSERT INTO reservas (usuario, puesto, nombre, horario) VALUES (%s, %s, %s, %s)', (usuario, puesto, nombre, 'Vitalicio',))
        conexion.commit()
        return render_template('dashboard.html', message3='Puesto vitalicio asignado correctamente')


@app.route("/eliminar_vitalicio", methods = ["POST"])
def eliminar_vitalicio():
    data = request.get_json()
    puesto = data.get('puesto')
    cursor = conexion.cursor()
    cursor.execute('DELETE FROM reservas WHERE puesto = %s AND horario = %s', (puesto, 'Vitalicio',))
    conexion.commit()
    return jsonify({'message': 'Puesto vitalicio eliminado correctamente'})



@app.route("/asientos_hoy", methods = ["GET", "POST"])
def asientos_hoy():
    cursor = conexion.cursor()
    data = request.get_json()
    date = data.get('date')
    try:
        cursor.execute('SELECT nombre, puesto, horario FROM reservas WHERE fecha_agendamiento = %s', (date,))
        puestos_hoy = [(row[0], row[1], row[2]) for row in cursor.fetchall()]
    except Error as e:
        conexion.rollback()
        puestos_hoy = []
    finally:
        cursor.close()
    return jsonify(puestos_hoy)



@app.route('/reservations/<date>', methods=["GET", "POST"])
def get_reservations(date):
    data = request.get_json()
    horario = data.get('horario')
    cursor = conexion.cursor()
    cursor.execute('SELECT puesto FROM reservas WHERE (fecha_agendamiento = %s AND horario = %s) OR horario = %s', (date, horario, 'Vitalicio',))
    reservations = [row[0] for row in cursor.fetchall()]
    return jsonify(reservations)



@app.route('/reservations', methods=['POST'])
def reservations():
    
    if 'username' in session:
        print(session['username'])
        usuario = session['username']
        data = request.get_json()
        puesto = data.get('puesto')
        fecha_agendamiento = data.get('fecha_agendamiento')
        fecha = data.get('fecha')
        horario = data.get('horario')

        cursor = conexion.cursor()
        # Verifica si el usuario ya tiene una reserva para el día seleccionado
        cursor.execute('SELECT COUNT(*) FROM RESERVAS WHERE usuario = %s AND fecha_agendamiento = %s AND horario = %s', (usuario, fecha_agendamiento, horario))
        reservas_usuario = cursor.fetchone()[0]

        if reservas_usuario > 0:
            return jsonify({'message': 'Ya tienes una reserva para este día en este horario'}), 409

        else:
        # Crea la consulta SQL
            cursor.execute('SELECT nombre FROM login WHERE usuario = %s', (usuario,))
            nombre = cursor.fetchone()
            query = 'INSERT INTO RESERVAS (usuario, puesto, fecha_agendamiento, nombre, horario) VALUES (%s, %s, %s, %s, %s)'

            # Ejecuta la consulta
            cursor.execute(query, (usuario, puesto, fecha_agendamiento, nombre, horario,))
            conexion.commit()
            print('La consulta SQL se ejecutó correctamente')
            return jsonify({'message': 'Reserva realizada correctamente'})



@app.route("/reserva")
def reserva():
    if request.referrer is None:
        return redirect(url_for('login'))
    if 'username' in session:
        return render_template("reserva.html", usuario=session['username'])

    else:
        return redirect(url_for('login'))



def pagina_no_encontrada(error):
    return redirect(url_for('login'))



@app.route("/reservas_usuario", methods = ["GET", "POST"])
def reservas_usuario():
    cursor = conexion.cursor()
    data = request.get_json()
    usuario = session['username']
    date = data.get('date')
    cursor.execute('SELECT fecha_agendamiento, puesto, horario FROM reservas WHERE usuario = %s AND fecha_agendamiento > %s', (usuario, date,))
    reservas = [(row[0], row[1], row[2]) for row in cursor.fetchall()]
    conexion.commit()
    return jsonify(reservas)



@app.route("/eliminar_reserva", methods = ["GET", "POST"])
def eliminar_reserva():
    if request.method == 'POST':
        data = request.get_json()
        usuario = session['username']
        puesto = data.get('puesto')
        fecha = data.get('date')
        horario = data.get('horario')
        cursor = conexion.cursor()
        cursor.execute('DELETE FROM reservas WHERE usuario = %s AND puesto = %s AND fecha_agendamiento = %s AND horario = %s', (usuario, puesto, fecha, horario,))
        conexion.commit()
        return jsonify({'message': 'Reserva eliminada correctamente'})

    return redirect(url_for('reserva'))


@app.route("/eliminar_reserva_admin", methods = ["GET", "POST"])
def eliminar_reserva_admin():
    if request.method == 'POST':
        data = request.get_json()
        nombre = data.get('nombre')
        fecha = data.get('date')
        puesto = data.get('puesto')
        horario = data.get('horario')
        cursor = conexion.cursor()
        print(nombre)
        print(fecha)
        print(puesto)
        cursor.execute('DELETE FROM reservas WHERE nombre = %s AND puesto = %s AND fecha_agendamiento = %s AND horario = %s', (nombre, puesto, fecha, horario,))
        conexion.commit()
        return jsonify({'message': 'Reserva eliminada correctamente'})

    return redirect(url_for('reserva'))



app.register_error_handler(404, pagina_no_encontrada)

if __name__ == "__main__":
    app.run(debug = True)

from flask import Flask, render_template, url_for, redirect, jsonify, request, session
import psycopg2
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta

conexion = psycopg2.connect(
    host = "localhost",
    database = "pruebas",
    user = "admin",
    password = "P.Q-37sop"
)

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'

usuario = None
fecha = None

# Crear usuario

#def create_user(username, password):
    #hashed_password = generate_password_hash(password)
    #cursor = conexion.cursor()
    #cursor.execute('INSERT INTO login (usuario, contraseña) VALUES (%s, %s)', (username, hashed_password))
    #conexion.commit()

# Crear reserva

def insert_reservation(usuario, puesto, fecha_agendamiento):
    print(usuario, puesto, fecha_agendamiento)
    # Verifica que todos los datos necesarios estén presentes
    if not usuario or not puesto or not fecha_agendamiento:
        print('Faltan datos para la reserva')
        return

    # Crea la consulta SQL
    query = 'INSERT INTO RESERVAS (usuario, puesto, fecha_agendamiento) VALUES (%s, %s, %s)'

    # Ejecuta la consulta
    cursor = conexion.cursor()
    cursor.execute(query, (usuario, puesto, fecha_agendamiento))
    conexion.commit()
    print('La consulta SQL se ejecutó correctamente')

#insert_reservation('Pedroo', 10, '2024-04-30')

@app.route("/login", methods = ["GET", "POST"])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        usuario = username
        password = request.form['password']
        
        cursor = conexion.cursor()
        cursor.execute('SELECT contraseña FROM login WHERE usuario = %s', (username,))
        hashed_password = cursor.fetchone()
        
        if hashed_password is None or not check_password_hash(hashed_password[0], password):
            error = 'Invalid username or password'
        else:
            session['username'] = username
            return redirect(url_for('reserva'))
        
    return render_template("login.html", error=error)

@app.route('/reservations/<date>', methods=['GET'])
def get_reservations(date):
    cursor = conexion.cursor()
    cursor.execute('SELECT puesto FROM reservas WHERE fecha_agendamiento = %s', (date,))
    reservations = [row[0] for row in cursor.fetchall()]
    return jsonify(reservations)

@app.route('/reservations', methods=['POST'])
def reservations():

    if 'username' in session:
        usuario = session['username']
        print(usuario)
        data = request.get_json()
        print(data)
        puesto = data.get('puesto')
        fecha_agendamiento = data.get('fecha_agendamiento')
        fecha = data.get('fecha')
        insert_reservation(usuario, puesto, fecha_agendamiento)
        return redirect(url_for('confirmacion', usuario=usuario, fecha=fecha))
    else:
        return jsonify({'error': 'No se ha iniciado sesión'}), 401


@app.route("/reserva")
def reserva():
    if 'username' in session:
        return render_template("reserva.html", usuario=session['username'])

    else:
        return redirect(url_for('login'))

@app.route("/logout", methods = ["POST"])
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

def pagina_no_encontrada(error):
    return redirect(url_for('login'))

@app.route("/confirmacion", methods = ["GET", "POST"])
def confirmacion():
    usuario = request.args.get('usuario')
    fecha = request.args.get('fecha')
    return render_template("confirmacion.html", usuario=usuario, fecha=fecha)

app.register_error_handler(404, pagina_no_encontrada)

if __name__ == "__main__":
    app.run(debug = True)

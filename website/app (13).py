from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS, cross_origin
import random
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'e5a45e0c1b1d89f5d2d6a7851c3f71e1'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.debug = True  # Debug-Mode

# Global CORS-Konfiguration – alle Origins, alle Methoden (GET, POST, PATCH, DELETE, OPTIONS)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.errorhandler(Exception)
def handle_exception(e):
    code = 500
    if hasattr(e, 'code'):
        code = e.code
    message = str(e) if app.debug else "Es ist ein Fehler aufgetreten."
    response = jsonify({"message": message})
    response.status_code = code
    return response

db = SQLAlchemy(app)

# ------------------- Datenbankmodelle -------------------

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(10), primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    person_type = db.Column(db.String(50), default='Schüler')
    faecher = db.relationship('Fach', backref='user', lazy=True)
    hausaufgaben = db.relationship('Hausaufgabe', backref='user', lazy=True)
    noten = db.relationship('Note', backref='user', lazy=True)
    groups = db.relationship('Group', backref='user', lazy=True)
    cards = db.relationship('Card', backref='user', lazy=True)

    @staticmethod
    def generate_unique_id():
        while True:
            random_id = ''.join(random.choices('0123456789', k=10))
            if not User.query.filter_by(id=random_id).first():
                return random_id

class Fach(db.Model):
    __tablename__ = "faecher"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)
    hausaufgaben = db.relationship('Hausaufgabe', backref='fach', cascade="all, delete-orphan", lazy=True)
    noten = db.relationship('Note', backref='fach', cascade="all, delete-orphan", lazy=True)

class Hausaufgabe(db.Model):
    __tablename__ = "hausaufgaben"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default='offen')
    fach_id = db.Column(db.Integer, db.ForeignKey('faecher.id'), nullable=False)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)
    comment = db.Column(db.Text, nullable=True, default="")        # Kommentar-Feld
    is_class_task = db.Column(db.Boolean, default=False)       # Kennzeichnet Klassenaufgaben
    klasse_id = db.Column(db.Integer, nullable=True)           # Für Klassenaufgaben
    submitted_students = db.Column(db.Text, nullable=True, default='[]')      # JSON-Array als String
    task_type = db.Column(db.String(50), nullable=False, default='hausaufgabe')      # Neuer Feld für Typ

class Note(db.Model):
    __tablename__ = "noten"
    id = db.Column(db.Integer, primary_key=True)
    note = db.Column(db.String(10), nullable=False)
    art = db.Column(db.String(50), nullable=True)
    fach_id = db.Column(db.Integer, db.ForeignKey('faecher.id'), nullable=False)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)

class Group(db.Model):
    __tablename__ = "groups"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)
    cards = db.relationship('Card', backref='group', cascade="all, delete-orphan", lazy=True)

class Card(db.Model):
    __tablename__ = "cards"
    id = db.Column(db.Integer, primary_key=True)
    front = db.Column(db.Text, nullable=False)
    back = db.Column(db.Text, nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)

class StundenplanEntry(db.Model):
    __tablename__ = "stundenplan"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)
    tag = db.Column(db.String(20), nullable=False)
    stunde = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    __table_args__ = (db.UniqueConstraint('user_id', 'tag', 'stunde', name='_user_tag_stunde_uc'),)

class StundenplanConfig(db.Model):
    __tablename__ = "stundenplan_config"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(10), db.ForeignKey('users.id'), unique=True, nullable=False)
    stundenanzahl = db.Column(db.Integer, nullable=False, default=8)

# ------------------- Datenbankmodell für Klassen -------------------

klasse_students = db.Table('klasse_students',
    db.Column('klasse_id', db.Integer, db.ForeignKey('klassen.id'), primary_key=True),
    db.Column('student_id', db.String(10), db.ForeignKey('users.id'), primary_key=True)
)

class Klasse(db.Model):
    __tablename__ = "klassen"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    teacher_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)
    students = db.relationship('User', secondary=klasse_students, backref='klassen')

# ------------------- Neues Datenbankmodell: Strichliste -------------------
class StrichlisteEntry(db.Model):
    __tablename__ = "strichliste"
    id = db.Column(db.Integer, primary_key=True)
    klasse_id = db.Column(db.Integer, db.ForeignKey('klassen.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# ------------------- Neues Datenbankmodell: Missing History -------------------
class MissingHistory(db.Model):
    __tablename__ = "missing_history"
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(10), db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.Integer, nullable=False)  # Referenziert die Hausaufgabe
    title = db.Column(db.String(150), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    missing = db.Column(db.Text, nullable=False, default="[]")  # Als JSON-String gespeichert

# ------------------- Endpunkte für Missing History -------------------

@app.route('/missing_history', methods=['GET', 'POST', 'DELETE'])
def manage_missing_history():
    if request.method == 'GET':
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({'message': 'teacher_id fehlt'}), 400
        records = MissingHistory.query.filter_by(teacher_id=teacher_id).all()
        result = []
        for record in records:
            result.append({
                'id': record.id,
                'task_id': record.task_id,
                'title': record.title,
                'timestamp': record.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'missing': json.loads(record.missing)
            })
        return jsonify(result), 200

    elif request.method == 'POST':
        data = request.json
        required = ['teacher_id', 'task_id', 'title', 'missing']
        if not all(key in data for key in required):
            return jsonify({'message': 'Fehlende Parameter'}), 400
        new_record = MissingHistory(
            teacher_id=data['teacher_id'],
            task_id=data['task_id'],
            title=data['title'],
            missing=json.dumps(data['missing'])
        )
        db.session.add(new_record)
        try:
            db.session.commit()
            return jsonify({'message': 'Missing history record added.', 'id': new_record.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Missing History.'}), 500

    elif request.method == 'DELETE':
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({'message': 'teacher_id fehlt'}), 400
        try:
            MissingHistory.query.filter_by(teacher_id=teacher_id).delete()
            db.session.commit()
            return jsonify({'message': 'Missing history reset.'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Zurücksetzen der Missing History.'}), 500

# Neuer Endpunkt: Aggregierte Missing History (pro Schüler)
@app.route('/missing_history/aggregate', methods=['GET'])
def aggregate_missing_history():
    teacher_id = request.args.get('teacher_id')
    if not teacher_id:
        return jsonify({'message': 'teacher_id fehlt'}), 400
    records = MissingHistory.query.filter_by(teacher_id=teacher_id).all()
    aggregated = {}
    for record in records:
        try:
            missing_list = json.loads(record.missing)
        except:
            missing_list = []
        for student in missing_list:
            sid = student.get('student_id')
            email = student.get('email')
            if sid in aggregated:
                aggregated[sid]['count'] += 1
                aggregated[sid]['details'].append({
                    'task_id': record.task_id,
                    'title': record.title,
                    'timestamp': record.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                })
            else:
                aggregated[sid] = {
                    'student_id': sid,
                    'email': email,
                    'count': 1,
                    'details': [{
                        'task_id': record.task_id,
                        'title': record.title,
                        'timestamp': record.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                    }]
                }
    aggregated_list = list(aggregated.values())
    return jsonify(aggregated_list), 200

# ------------------- Weitere Endpunkte (Users, Fächer, Hausaufgaben, Noten, Groups, Cards, Stundenplan, Klassen) -------------------
# (Hier folgt der bisherige Code – siehe oben – unverändert. Aus Platzgründen wurden diese Endpunkte hier nicht nochmals kommentiert.)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(
        id=User.generate_unique_id(),
        email=data['email'],
        password=hashed_password,
        person_type=data.get('person_type', 'Schüler')
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Registrierung erfolgreich!", "user_id": new_user.id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Datenbankfehler. Bitte erneut versuchen."}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({"message": "Login erfolgreich!", "user_id": user.id, "person_type": user.person_type}), 200
    return jsonify({"message": "Falsche Login-Daten"}), 401

@app.route('/faecher', methods=['GET', 'POST'])
def manage_faecher():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        faecher = Fach.query.filter_by(user_id=user_id).all()
        return jsonify([{'id': fach.id, 'name': fach.name} for fach in faecher])
    if request.method == 'POST':
        data = request.json
        if 'name' not in data or 'user_id' not in data:
            return jsonify({'message': 'Fehlende Parameter'}), 400
        new_fach = Fach(name=data['name'], user_id=data['user_id'])
        try:
            db.session.add(new_fach)
            db.session.commit()
            return jsonify({'message': 'Fach erfolgreich hinzugefügt!', 'fach_id': new_fach.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen des Fachs. Bitte erneut versuchen.'}), 500

@app.route('/faecher/<int:fach_id>', methods=['DELETE'])
def delete_fach(fach_id):
    fach = Fach.query.get(fach_id)
    if not fach:
        return jsonify({'message': 'Fach nicht gefunden.'}), 404
    try:
        db.session.delete(fach)
        db.session.commit()
        return jsonify({'message': 'Fach erfolgreich gelöscht.'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Fehler beim Löschen des Fachs.'}), 500
    
class GrammarTable(db.Model):
    __tablename__ = "grammarTables"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    rows = db.Column(db.Text, nullable=False)  # Speichert die Zeilen als JSON-String
    user_id = db.Column(db.String(10), nullable=False)

# GET und POST Endpunkt für Grammatik Tabellen
@app.route('/grammarTables', methods=['GET', 'POST'])
def manage_grammar_tables():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"message": "user_id fehlt"}), 400
        tables = GrammarTable.query.filter_by(user_id=user_id).all()
        result = []
        for table in tables:
            try:
                rows = json.loads(table.rows)
            except Exception:
                rows = []
            result.append({
                'id': table.id,
                'name': table.name,
                'rows': rows
            })
        return jsonify(result), 200

    elif request.method == 'POST':
        data = request.json
        if 'name' not in data or 'rows' not in data or 'user_id' not in data:
            return jsonify({"message": "Fehlende Parameter"}), 400
        new_table = GrammarTable(
            name=data['name'],
            rows=json.dumps(data['rows']),
            user_id=data['user_id']
        )
        try:
            db.session.add(new_table)
            db.session.commit()
            return jsonify({"message": "Grammatik Tabelle erfolgreich hinzugefügt", "table_id": new_table.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Fehler beim Hinzufügen der Grammatik Tabelle"}), 500

# DELETE Endpunkt für eine Grammatik Tabelle
@app.route('/grammarTables/<int:table_id>', methods=['DELETE'])
def delete_grammar_table(table_id):
    table = GrammarTable.query.get(table_id)
    if not table:
        return jsonify({"message": "Grammatik Tabelle nicht gefunden"}), 404
    try:
        db.session.delete(table)
        db.session.commit()
        return jsonify({"message": "Grammatik Tabelle erfolgreich gelöscht"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Fehler beim Löschen der Grammatik Tabelle"}), 500


@app.route('/hausaufgaben', methods=['GET', 'POST'])
def manage_hausaufgaben():
    if request.method == 'GET':
        fach_id = request.args.get('fach_id')
        user_id = request.args.get('user_id')
        task_type = request.args.get('task_type')  # neuer Filter-Parameter
        if fach_id:
            query = Hausaufgabe.query.filter_by(fach_id=fach_id)
        elif user_id:
            query = Hausaufgabe.query.filter_by(user_id=user_id)
        else:
            query = Hausaufgabe.query
        if task_type:
            query = query.filter_by(task_type=task_type)
        tasks = query.all()
        return jsonify([{
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'deadline': task.deadline.strftime('%Y-%m-%d'),
            'status': task.status,
            'fach_id': task.fach_id,
            'user_id': task.user_id,
            'comment': task.comment if task.comment is not None else "",
            'is_class_task': task.is_class_task,
            'task_type': task.task_type
        } for task in tasks])
    if request.method == 'POST':
        data = request.json
        required = ['title', 'deadline', 'fach_id', 'user_id']
        if not all(key in data for key in required):
            return jsonify({'message': 'Fehlende Parameter'}), 400
        try:
            deadline = datetime.strptime(data['deadline'], '%Y-%m-%d')
            new_task = Hausaufgabe(
                title=data['title'],
                description=data.get('description'),
                deadline=deadline,
                fach_id=data['fach_id'],
                user_id=data['user_id'],
                comment="",
                is_class_task=False,
                task_type=data.get('task_type', 'hausaufgabe')  # Hier wird der Typ gesetzt
            )
            db.session.add(new_task)
            db.session.commit()
            return jsonify({'message': 'Hausaufgabe erfolgreich hinzugefügt!', 'task_id': new_task.id}), 201
        except ValueError:
            return jsonify({'message': 'Ungültiges Datumsformat. Bitte verwenden Sie YYYY-MM-DD.'}), 400
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Hausaufgabe. Bitte erneut versuchen.'}), 500

@app.route('/hausaufgaben/<int:task_id>', methods=['PATCH', 'DELETE'])
@cross_origin()
def modify_hausaufgabe(task_id):
    task = Hausaufgabe.query.get(task_id)
    if not task:
        return jsonify({'message': 'Hausaufgabe nicht gefunden.'}), 404
    if request.method == 'PATCH':
        data = request.json
        if 'status' in data:
            task.status = data['status']
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'deadline' in data:
            try:
                task.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d')
            except ValueError:
                return jsonify({'message': 'Ungültiges Datumsformat.'}), 400
        if 'comment' in data:
            task.comment = data['comment']
        try:
            db.session.commit()
            return jsonify({'message': 'Hausaufgabe erfolgreich aktualisiert.'}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Aktualisieren der Hausaufgabe.'}), 500
    if request.method == 'DELETE':
        try:
            db.session.delete(task)
            db.session.commit()
            return jsonify({'message': 'Hausaufgabe erfolgreich gelöscht.'}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Löschen der Hausaufgabe.'}), 500

@app.route('/noten', methods=['GET', 'POST'])
def manage_noten():
    if request.method == 'GET':
        fach_id = request.args.get('fach_id')
        user_id = request.args.get('user_id')
        if fach_id:
            notes = Note.query.filter_by(fach_id=fach_id).all()
        elif user_id:
            notes = Note.query.filter_by(user_id=user_id).all()
        else:
            notes = Note.query.all()
        return jsonify([{
            'id': note.id,
            'note': note.note,
            'art': note.art,
            'fach_id': note.fach_id
        } for note in notes])
    if request.method == 'POST':
        data = request.json
        if 'note' not in data or 'art' not in data or 'fach_id' not in data or 'user_id' not in data:
            return jsonify({'message': 'Fehlende Parameter'}), 400
        new_note = Note(
            note=data['note'],
            art=data['art'],
            fach_id=data['fach_id'],
            user_id=data['user_id']
        )
        try:
            db.session.add(new_note)
            db.session.commit()
            return jsonify({'message': 'Note erfolgreich hinzugefügt!', 'note_id': new_note.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Note. Bitte erneut versuchen.'}), 500

@app.route('/noten/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    note = Note.query.get(note_id)
    if not note:
        return jsonify({'message': 'Note nicht gefunden.'}), 404
    try:
        db.session.delete(note)
        db.session.commit()
        return jsonify({'message': 'Note erfolgreich gelöscht.'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Fehler beim Löschen der Note.'}), 500

@app.route('/noten/<int:fach_id>/average', methods=['GET'])
def calculate_average_endpoint(fach_id):
    notes = Note.query.filter_by(fach_id=fach_id).all()
    if not notes:
        return jsonify({'average': 'N/A'})
    noten_werte = {
        '1+': 0.66, 
        '1': 1.0, 
        '1-': 1.33,
        '2+': 1.66, 
        '2': 2.0, 
        '2-': 2.33,
        '3+': 2.66, 
        '3': 3.0, 
        '3-': 3.33,
        '4+': 3.66, 
        '4': 4.0, 
        '4-': 4.33,
        '5+': 4.66, 
        '5': 5.0, 
        '5-': 5.33,
        '6+': 5.66, 
        '6': 6.0, 
        '6-': 6.33
    }
    gewichtungen = {
        'Klassenarbeit': 3,
        'HÜ': 1,
        'epo': 2
    }
    total = 0
    total_gewichtung = 0
    for note in notes:
        note_wert = noten_werte.get(note.note, 0)
        gewichtung = gewichtungen.get(note.art, 1)
        total += note_wert * gewichtung
        total_gewichtung += gewichtung
    if total_gewichtung == 0:
        return jsonify({'average': 'N/A'})
    average = total / total_gewichtung
    if average < 1.0:
        note_display = '1+'
    elif average < 1.34:
        note_display = '1'
    elif average < 1.67:
        note_display = '1-'
    elif average < 2.0:
        note_display = '2+'
    elif average < 2.34:
        note_display = '2'
    elif average < 2.67:
        note_display = '2-'
    elif average < 3.0:
        note_display = '3+'
    elif average < 3.34:
        note_display = '3'
    elif average < 3.67:
        note_display = '3-'
    elif average < 4.0:
        note_display = '4+'
    elif average < 4.34:
        note_display = '4'
    elif average < 4.67:
        note_display = '4-'
    elif average < 5.0:
        note_display = '5+'
    elif average < 5.34:
        note_display = '5'
    elif average < 5.67:
        note_display = '5-'
    elif average < 6.0:
        note_display = '6+'
    elif average < 6.34:
        note_display = '6'
    else:
        note_display = '6-'
    result = f"{note_display} ({average:.2f})"
    return jsonify({'average': result})

@app.route('/groups', methods=['GET', 'POST'])
def manage_groups():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        groups = Group.query.filter_by(user_id=user_id).all()
        return jsonify([{'id': group.id, 'name': group.name} for group in groups])
    if request.method == 'POST':
        data = request.json
        if 'name' not in data or 'user_id' not in data:
            return jsonify({'message': 'Fehlende Parameter'}), 400
        new_group = Group(name=data['name'], user_id=data['user_id'])
        try:
            db.session.add(new_group)
            db.session.commit()
            return jsonify({'message': 'Gruppe erfolgreich hinzugefügt!', 'group_id': new_group.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Gruppe.'}), 500

@app.route('/groups/<int:group_id>', methods=['DELETE'])
def delete_group(group_id):
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'message': 'Gruppe nicht gefunden.'}), 404
    try:
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Gruppe erfolgreich gelöscht.'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Fehler beim Löschen der Gruppe.'}), 500

@app.route('/cards', methods=['GET', 'POST'])
def manage_cards():
    if request.method == 'GET':
        group_id = request.args.get('group_id')
        if group_id:
            cards = Card.query.filter_by(group_id=group_id).all()
        else:
            cards = Card.query.all()
        return jsonify([{'id': card.id, 'front': card.front, 'back': card.back, 'group_id': card.group_id} for card in cards])
    if request.method == 'POST':
        data = request.json
        if 'front' not in data or 'back' not in data or 'group_id' not in data or 'user_id' not in data:
            return jsonify({'message': 'Fehlende Parameter'}), 400
        new_card = Card(
            front=data['front'],
            back=data['back'],
            group_id=data['group_id'],
            user_id=data['user_id']
        )
        try:
            db.session.add(new_card)
            db.session.commit()
            return jsonify({'message': 'Karte erfolgreich hinzugefügt!', 'card_id': new_card.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Karte.'}), 500

@app.route('/cards/<int:card_id>', methods=['DELETE'])
def delete_card(card_id):
    card = Card.query.get(card_id)
    if not card:
        return jsonify({'message': 'Karte nicht gefunden.'}), 404
    try:
        db.session.delete(card)
        db.session.commit()
        return jsonify({'message': 'Karte erfolgreich gelöscht.'}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Fehler beim Löschen der Karte.'}), 500

@app.route('/stundenplan', methods=['GET', 'POST', 'DELETE'])
def manage_stundenplan():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'message': 'user_id fehlt'}), 400
        entries = StundenplanEntry.query.filter_by(user_id=user_id).all()
        result = [{
            'id': entry.id,
            'tag': entry.tag,
            'stunde': entry.stunde,
            'name': entry.name
        } for entry in entries]
        return jsonify(result), 200

    elif request.method == 'POST':
        data = request.json
        required = ['user_id', 'tag', 'stunde', 'name']
        if not all(key in data for key in required):
            return jsonify({'message': 'Fehlende Parameter'}), 400

        entry = StundenplanEntry.query.filter_by(
            user_id=data['user_id'],
            tag=data['tag'],
            stunde=data['stunde']
        ).first()
        if entry:
            entry.name = data['name']
        else:
            entry = StundenplanEntry(
                user_id=data['user_id'],
                tag=data['tag'],
                stunde=data['stunde'],
                name=data['name']
            )
            db.session.add(entry)
        try:
            db.session.commit()
            return jsonify({'message': 'Stundenplaneintrag gespeichert', 'id': entry.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Fehler: {str(e)}'}), 500

    elif request.method == 'DELETE':
        user_id = request.args.get('user_id')
        tag = request.args.get('tag')
        stunde = request.args.get('stunde')
        if not all([user_id, tag, stunde]):
            return jsonify({'message': 'Fehlende Parameter'}), 400
        try:
            stunde_int = int(stunde)
        except ValueError:
            return jsonify({'message': 'Ungültiger Wert für stunde'}), 400
        entry = StundenplanEntry.query.filter_by(
            user_id=user_id,
            tag=tag,
            stunde=stunde_int
        ).first()
        if not entry:
            return jsonify({'message': 'Eintrag nicht gefunden'}), 404
        try:
            db.session.delete(entry)
            db.session.commit()
            return jsonify({'message': 'Eintrag gelöscht'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Fehler: {str(e)}'}), 500

@app.route('/stundenplan_config', methods=['GET', 'POST'])
def manage_stundenplan_config():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'message': 'user_id fehlt'}), 400
        config = StundenplanConfig.query.filter_by(user_id=user_id).first()
        if config:
            return jsonify({'stundenanzahl': config.stundenanzahl}), 200
        else:
            return jsonify({'stundenanzahl': 6}), 200  

    elif request.method == 'POST':
        data = request.json
        if 'user_id' not in data or 'stundenanzahl' not in data:
            return jsonify({'message': 'Fehlende Parameter'}), 400
        try:
            stundenanzahl = int(data['stundenanzahl'])
        except ValueError:
            return jsonify({'message': 'Ungültiger Wert für stundenanzahl'}), 400

        config = StundenplanConfig.query.filter_by(user_id=data['user_id']).first()
        if config:
            config.stundenanzahl = stundenanzahl
        else:
            config = StundenplanConfig(user_id=data['user_id'], stundenanzahl=stundenanzahl)
            db.session.add(config)
        try:
            db.session.commit()
            return jsonify({'message': 'Stundenanzahl gespeichert', 'stundenanzahl': stundenanzahl}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Fehler: {str(e)}'}), 500

@app.route('/klassen', methods=['GET', 'POST'])
def manage_klassen():
    if request.method == 'GET':
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({'message': 'teacher_id fehlt'}), 400
        klassen = Klasse.query.filter_by(teacher_id=teacher_id).all()
        result = []
        for k in klassen:
            result.append({
                'id': k.id,
                'name': k.name,
                'teacher_id': k.teacher_id,
                'students': [student.id for student in k.students]
            })
        return jsonify(result), 200

    if request.method == 'POST':
        data = request.json
        required = ['name', 'teacher_id']
        if not all(key in data for key in required):
            return jsonify({'message': 'Fehlende Parameter'}), 400
        new_klasse = Klasse(name=data['name'], teacher_id=data['teacher_id'])
        db.session.add(new_klasse)
        try:
            db.session.commit()
            return jsonify({'message': 'Klasse erfolgreich hinzugefügt.', 'klasse_id': new_klasse.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Klasse.'}), 500

@app.route('/klassen/<int:klasse_id>/students', methods=['POST'])
def add_student_to_klasse(klasse_id):
    data = request.json
    if 'student_id' not in data and 'student_ids' not in data:
        return jsonify({'message': 'student_id oder student_ids fehlt'}), 400
    klasse = Klasse.query.get(klasse_id)
    if not klasse:
        return jsonify({'message': 'Klasse nicht gefunden.'}), 404

    added_students = []
    errors = []
    if 'student_ids' in data:
        student_ids = data['student_ids']
        if isinstance(student_ids, str):
            student_ids = student_ids.split()
        if not isinstance(student_ids, list):
            return jsonify({'message': 'student_ids muss eine Liste oder ein durch Leerzeichen getrennte Zeichenkette sein.'}), 400
        for sid in student_ids:
            student = User.query.get(sid)
            if not student:
                errors.append(f'Student {sid} nicht gefunden.')
                continue
            if student in klasse.students:
                errors.append(f'Student {sid} ist bereits in der Klasse.')
                continue
            klasse.students.append(student)
            added_students.append(sid)
    elif 'student_id' in data:
        sid = data['student_id']
        student = User.query.get(sid)
        if not student:
            return jsonify({'message': 'Student nicht gefunden.'}), 404
        if student in klasse.students:
            return jsonify({'message': 'Student ist bereits in der Klasse.'}), 400
        klasse.students.append(student)
        added_students.append(sid)
    try:
        db.session.commit()
        response = {'message': 'Student(en) erfolgreich zur Klasse hinzugefügt.', 'added_students': added_students}
        if errors:
            response['errors'] = errors
        return jsonify(response), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Fehler beim Hinzufügen der Schüler.'}), 500

@app.route('/klassen/<int:klasse_id>/hausaufgaben', methods=['GET', 'POST'])
def manage_klassen_hausaufgaben(klasse_id):
    klasse = Klasse.query.get(klasse_id)
    if not klasse:
        return jsonify({'message': 'Klasse nicht gefunden.'}), 404

    if request.method == 'GET':
        tasks = Hausaufgabe.query.filter_by(klasse_id=klasse_id, is_class_task=True).all()
        result = [({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'deadline': task.deadline.strftime('%Y-%m-%d'),
            'status': task.status,
            'fach_id': task.fach_id,
            'user_id': task.user_id,
            'comment': task.comment if task.comment is not None else "",
            'is_class_task': task.is_class_task,
            'klasse_id': task.klasse_id,
            'submitted_students': task.submitted_students
        }) for task in tasks]
        return jsonify(result), 200

    if request.method == 'POST':
        data = request.json
        required = ['teacher_id', 'title', 'deadline', 'fach_id']
        if not all(key in data for key in required):
            return jsonify({'message': 'Fehlende Parameter'}), 400

        if klasse.teacher_id != data['teacher_id']:
            return jsonify({'message': 'Nicht berechtigt.'}), 403

        try:
            deadline = datetime.strptime(data['deadline'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'message': 'Ungültiges Datumsformat. Bitte verwenden Sie YYYY-MM-DD.'}), 400

        teacher_fach = Fach.query.filter_by(id=data['fach_id'], user_id=data['teacher_id']).first()
        if not teacher_fach:
            return jsonify({'message': 'Fach nicht gefunden für den Lehrer.'}), 404

        new_task = Hausaufgabe(
            title=data['title'],
            description=data.get('description'),
            deadline=deadline,
            fach_id=teacher_fach.id,
            user_id=data['teacher_id'],
            comment="",
            is_class_task=True,
            klasse_id=klasse_id,
            submitted_students=json.dumps([])
        )
        db.session.add(new_task)
        try:
            db.session.commit()
            return jsonify({'message': 'Klassenhausaufgabe erfolgreich hinzugefügt.', 'task_id': new_task.id}), 201
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Hinzufügen der Klassenhausaufgabe. Bitte erneut versuchen.'}), 500

@app.route('/klassen/hausaufgaben/<int:task_id>', methods=['PATCH', 'DELETE'])
@cross_origin()
def modify_klassen_hausaufgabe(task_id):
    task = Hausaufgabe.query.get(task_id)
    if not task or not task.is_class_task:
        return jsonify({'message': 'Klassenhausaufgabe nicht gefunden.'}), 404
    if request.method == 'PATCH':
        data = request.json
        if 'status' in data:
            task.status = data['status']
        if 'comment' in data:
            task.comment = data['comment']
        try:
            db.session.commit()
            return jsonify({'message': 'Klassenhausaufgabe erfolgreich aktualisiert.'}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Aktualisieren der Klassenhausaufgabe.'}), 500
    elif request.method == 'DELETE':
        try:
            db.session.delete(task)
            db.session.commit()
            return jsonify({'message': 'Klassenhausaufgabe erfolgreich gelöscht.'}), 200
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Fehler beim Löschen der Klassenhausaufgabe.'}), 500

@app.route('/klassen/hausaufgaben/<int:task_id>/missing', methods=['GET'])
def missing_submissions(task_id):
    task = Hausaufgabe.query.get(task_id)
    if not task or not task.is_class_task or not task.klasse_id:
        return jsonify({'message': 'Klassenhausaufgabe nicht gefunden.'}), 404
    try:
        submissions = json.loads(task.submitted_students) if task.submitted_students else []
    except:
        submissions = []
    klasse = Klasse.query.get(task.klasse_id)
    if not klasse:
        return jsonify({'message': 'Klasse nicht gefunden.'}), 404
    missing = []
    for student in klasse.students:
        if student.id not in submissions:
            missing.append({'student_id': student.id, 'email': student.email})
    return jsonify({'missing': missing}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Falls sich die Tabelle hausaufgaben ändert, werden ggf. die Spalten "comment", "is_class_task", "klasse_id" und "submitted_students" hinzugefügt
        with db.engine.connect() as connection:
            result = connection.execute(text("PRAGMA table_info(hausaufgaben)")).fetchall()
            columns = [row[1] for row in result]
            if "comment" not in columns:
                connection.execute(text("ALTER TABLE hausaufgaben ADD COLUMN comment TEXT DEFAULT ''"))
            if "is_class_task" not in columns:
                connection.execute(text("ALTER TABLE hausaufgaben ADD COLUMN is_class_task BOOLEAN DEFAULT 0"))
            if "klasse_id" not in columns:
                connection.execute(text("ALTER TABLE hausaufgaben ADD COLUMN klasse_id INTEGER"))
            if "submitted_students" not in columns:
                connection.execute(text("ALTER TABLE hausaufgaben ADD COLUMN submitted_students TEXT DEFAULT '[]'"))
            if "task_type" not in columns:
                connection.execute(text("ALTER TABLE hausaufgaben ADD COLUMN task_type TEXT DEFAULT 'hausaufgabe'"))
    app.run(debug=True, host="0.0.0.0", port=5000)

from flask import Flask
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from mongoengine import connect
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production

# MongoDB Atlas connection
# Replace with your MongoDB Atlas connection string
connect(host='mongodb+srv://event_db_user:bNYOSecXiecvNKjp@ecommerce.ktpdms6.mongodb.net/user_Data?appName=Ecommerce')

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'auth.login'

from models.user import User

@login_manager.user_loader
def load_user(user_id):
    return User.objects(id=user_id).first()

from routes.auth import auth_bp
from routes.main import main_bp

app.register_blueprint(auth_bp)
app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
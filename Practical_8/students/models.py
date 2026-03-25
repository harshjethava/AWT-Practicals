from mongoengine import Document, StringField, EmailField, IntField, DateTimeField
import datetime

class Student(Document):
    first_name = StringField(required=True, max_length=50)
    last_name = StringField(required=True, max_length=50)
    email = EmailField(required=True, unique=True)
    age = IntField(required=True, min_value=1)
    department = StringField(required=True, max_length=100)
    enrollment_date = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'students',
        'strict': False
    }

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

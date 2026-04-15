from mongoengine import Document, StringField, FloatField, DateTimeField
from datetime import datetime

class Product(Document):
    name = StringField(required=True)
    description = StringField()
    price = FloatField(required=True)
    image_url = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'products'
    }
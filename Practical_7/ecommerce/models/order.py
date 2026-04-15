from mongoengine import Document, ReferenceField, ListField, EmbeddedDocument, EmbeddedDocumentField, FloatField, DateTimeField, IntField
from datetime import datetime
from .user import User
from .product import Product

class OrderItem(EmbeddedDocument):
    product = ReferenceField(Product)
    quantity = IntField(required=True, min_value=1)
    price = FloatField(required=True)  # price at time of order

class Order(Document):
    user = ReferenceField(User, required=True)
    items = ListField(EmbeddedDocumentField(OrderItem))
    total = FloatField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'orders'
    }
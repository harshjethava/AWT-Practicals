from mongoengine import connect
from models.product import Product

uri = 'mongodb+srv://event_db_user:bNYOSecXiecvNKjp@ecommerce.ktpdms6.mongodb.net/user_Data?appName=Ecommerce'
connect(host=uri)
for p in Product.objects():
    print(p.name, repr(p.image_url))

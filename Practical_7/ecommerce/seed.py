from app import app
from models.product import Product

with app.app_context():
    # Sample products
    products = [
        {
            'name': 'Laptop',
            'description': 'High-performance laptop',
            'price': 999.99,
            'image_url': 'https://via.placeholder.com/300x200?text=Laptop'
        },
        {
            'name': 'Phone',
            'description': 'Smartphone with latest features',
            'price': 699.99,
            'image_url': 'https://via.placeholder.com/300x200?text=Phone'
        },
        {
            'name': 'Headphones',
            'description': 'Noise-cancelling headphones',
            'price': 199.99,
            'image_url': 'https://via.placeholder.com/300x200?text=Headphones'
        }
    ]

    for prod in products:
        product = Product(**prod)
        product.save()

    print("Sample products added.")
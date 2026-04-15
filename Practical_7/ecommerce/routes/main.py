from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
from flask_login import login_required, current_user
from flask_wtf import FlaskForm
from wtforms import IntegerField, validators
from models.product import Product
from models.order import Order, OrderItem

main_bp = Blueprint('main', __name__)

class AddToCartForm(FlaskForm):
    quantity = IntegerField('Quantity', [validators.NumberRange(min=1)])

@main_bp.route('/')
def home():
    products = Product.objects()
    return render_template('home.html', products=products)

@main_bp.route('/product/<product_id>', methods=['GET', 'POST'])
@login_required
def product_detail(product_id):
    product = Product.objects(id=product_id).first()
    if not product:
        abort(404)
    form = AddToCartForm(request.form)
    if request.method == 'POST' and form.validate():
        # For simplicity, we'll create order directly. In real app, use cart.
        order_item = OrderItem(product=product, quantity=form.quantity.data, price=product.price)
        order = Order(user=current_user, items=[order_item], total=product.price * form.quantity.data)
        order.save()
        flash('Purchase successful', 'success')
        return redirect(url_for('main.dashboard'))
    return render_template('product_detail.html', product=product, form=form)

@main_bp.route('/dashboard')
@login_required
def dashboard():
    orders = Order.objects(user=current_user)
    products = Product.objects()
    return render_template('dashboard.html', orders=orders, products=products)
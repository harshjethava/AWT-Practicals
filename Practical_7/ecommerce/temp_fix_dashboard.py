from pathlib import Path

path = Path('routes/main.py')
text = path.read_text()
old = """@main_bp.route('/dashboard')
@login_required
def dashboard():
    orders = Order.objects(user=current_user)
    return render_template('dashboard.html', orders=orders)
"""
new = """@main_bp.route('/dashboard')
@login_required
def dashboard():
    orders = Order.objects(user=current_user)
    products = Product.objects()
    return render_template('dashboard.html', orders=orders, products=products)
"""
if old not in text:
    raise SystemExit('Old block not found')
path.write_text(text.replace(old, new))
print('patched routes/main.py')

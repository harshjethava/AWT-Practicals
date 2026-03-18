#app
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return  """<h1>About Page </h1><button onclick="window.location.href='/'">Home</button>
    <button onclick="window.location.href='/contact'">Contact</button>"""

@app.route("/contact")
def contact():
    return """<h1>Contact Page </h1><button onclick="window.location.href='/'">Home</button>
    <button onclick="window.location.href='/about'">About</button>"""

if __name__ == "__main__":
    app.run(debug=True)
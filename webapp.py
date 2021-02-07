from flask import Flask, render_template, flash, request, jsonify, url_for, redirect

app = Flask(__name__)
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'

@app.route("/",methods = ['GET', 'POST'])
@app.route("/home",methods = ['GET', 'POST'])
def home():
	return render_template('home.html')	

if __name__=='__main__':
	app.run(debug=True)
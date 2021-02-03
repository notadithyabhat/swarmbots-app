const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d') //context

canvas.width = innerWidth 
canvas.height = innerHeight

const columns = 12, rows = 9;

const tileWidth  = Math.round(canvas.width / columns),
 tileHeight = Math.round(canvas.height / rows);

class Agv {
	constructor(id, x, y) {
		this.id= id
		this.x = x*tileWidth
		this.y = y*tileHeight
		this.color = 'green'
		this.destination = {x:this.x,y:this.y}
		this.angle=0
		this.velocity=0
		this.image = null
		this.image = new Image()
		this.state = 'AVAILABLE'
	}

	draw() {
		c.beginPath()
		this.image.src = "./images/"+this.color+".png"
		console.log(this.image.src)
		c.drawImage(this.image,this.x,this.y,tileWidth,tileWidth)
		c.font = "20px Arial"
		c.fillStyle = "white"
		c.textAlign = "center"
		c.fillText("AGV"+this.id, this.x+tileWidth/2, this.y+tileHeight/2)
		c.font = "15px Arial"
		c.fillStyle = "white"
		c.textAlign = "center"
		c.fillText(this.state,this.x+tileWidth/2, this.y+tileHeight/2+15)
	}


	update() {
		this.draw()
		this.angle = Math.atan2(
			this.destination.y - this.y,
			this.destination.x - this.x
		)
		this.velocity = {
			x: Math.cos(this.angle),
			y: Math.sin(this.angle)
		}
		if(Math.abs(this.destination.y - this.y)<1&&Math.abs(this.destination.x - this.x)<1)
		{
			this.color = 'green'
			this.state = 'AVAILABLE'
			this.x = this.destination.x
			this.y = this.destination.y
		}
		else
		{
			this.color = 'yellow'
			this.state = 'IN USE'
			this.x = this.x + this.velocity.x
			this.y = this.y + this.velocity.y
		}
	}
}

const agv1 = new Agv(1, 2, 2)
const agv2 = new Agv(2, 2, 3)
const agv3 = new Agv(3, 2, 4)

const agvs = [agv1,agv2,agv3]

function animate() {
	requestAnimationFrame(animate)
	c.clearRect(0,0,canvas.width,canvas.height)
	drawMatrix()
	agvs.forEach((agv) => {
		agv.update()
	})
}

function drawMatrix() {
	for (var i =1; i <= columns; i++) {
		c.beginPath();
		c.moveTo(tileWidth*i, 0);
		c.lineTo(tileWidth*i, canvas.height);
		c.stroke();
	}
	for (var i =1; i <= rows; i++) {
		c.beginPath();
		c.moveTo(0, tileHeight*i);
		c.lineTo(canvas.width,tileHeight*i);
		c.stroke();
	}
}

addEventListener('click', (event) =>  
	{
		var rect = canvas.getBoundingClientRect(),
        mx = event.clientX - rect.left,
        my = event.clientY - rect.top,
        xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth),
		yIndex = Math.round((my - tileHeight * 0.5) / tileHeight);

        var x = xIndex * tileWidth,
         	y = yIndex * tileHeight;

		agvs.forEach((agv) => {
			agv.destination={x:Math.floor(x),y:Math.floor(y)}
		})

	})

animate()

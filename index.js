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
		this.color = "#50C878"
		this.state = 'AVAILABLE'
		this.destination = {x:this.x,y:this.y}
		this.angle=0
		this.velocity=0
		this.image = null
		this.image = new Image()
		this.hover = false
		this.selected = false
	}

	draw() {
		c.beginPath()
		c.save()
		if(this.hover||this.selected){
			c.shadowColor = this.color
			c.shadowBlur = 15
		}
		c.fillStyle=this.color;
		c.strokeStyle=this.color;
		c.lineJoin = "round";
		c.lineWidth = tileWidth/5;
		c.strokeRect(this.x+(tileWidth/10), this.y+(tileWidth/10), tileWidth-tileWidth/5, tileHeight-tileWidth/5);
		c.fillRect(this.x+(tileWidth/10), this.y+(tileWidth/10), tileWidth-tileWidth/5, tileHeight-tileWidth/5);
		c.restore()
		c.font = "20px Arial"
		c.fillStyle = "white"
		c.textAlign = "center"
		c.fillText("AGV"+this.id, this.x+tileWidth/2, this.y+tileHeight/2)
		c.font = "15px Arial"
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
			this.color = "#50C878"
			this.state = 'AVAILABLE'
			this.x = this.destination.x
			this.y = this.destination.y
		}
		else
		{
			this.color = "#FFE338"
			this.state = 'IN USE'
			this.x = this.x + this.velocity.x
			this.y = this.y + this.velocity.y
		}
	}
}

const agv1 = new Agv(1, 2, 2)
const agv2 = new Agv(2, 4, 6)
const agv3 = new Agv(3, 2, 5)

const agvs = [agv1,agv2,agv3]

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

function animate() {
	requestAnimationFrame(animate)
	c.clearRect(0,0,canvas.width,canvas.height)
	drawMatrix()
	agvs.forEach((agv) => {
		agv.update()
	})
}

addEventListener('click', (event) =>  
	{
		var rect = canvas.getBoundingClientRect(),
        mx = event.clientX - rect.left,
        my = event.clientY - rect.top,
        xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth),
		yIndex = Math.round((my - tileWidth * 0.5) / tileHeight);

        var x = xIndex * tileWidth,
         	y = yIndex * tileHeight;


		agvs.forEach((agv) => {
			if(agv.x==x&&agv.y==y){
				agv.selected = agv.selected? false : true
				//console.log(agv.selected)
			}
			else {
				if(agv.selected){
					var flag=true;
					agvs.forEach((agv2) => {
						if((agv2.x==x&&agv2.y==y)){
							flag=false
							agv.selected=false
						}
					})
					if(flag){
						agv.destination={x:Math.floor(x),y:Math.floor(y)}
						agv.selected = false
					}
					//console.log(agv.selected)
				}	
			}

		})
	})



canvas.onmousemove = function(event) {
	var rect = canvas.getBoundingClientRect(),
        mx = event.clientX - rect.left,
        my = event.clientY - rect.top,
        xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth),
		yIndex = Math.round((my - tileHeight * 0.5) / tileHeight);

        var x = xIndex * tileWidth,
         	y = yIndex * tileHeight;

        agvs.forEach((agv) => {
			agv.hover=(x==agv.x&&y==agv.y)
		})
}

animate()
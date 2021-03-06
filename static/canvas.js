const canvas = document.getElementById('canvas')
const c = canvas.getContext('2d') //context

canvas.width = innerWidth/1.5
canvas.height = innerHeight/1.5

const columns = 12, rows = 8;

const tileWidth  = Math.round(canvas.width / columns),
 tileHeight = Math.round(canvas.height / rows);

function getFont(ratio) {
    var size = tileWidth * ratio;
    return (size|0) + 'px Arial';
}


class Destination {
	constructor(id,x,y,Width,Height) {
		this.x = x
		this.y = y
		this.color = "#398AD7"
		this.id = id
		this.Width=Width
		this.Height=Height
	}

	draw() {
		c.beginPath()
		c.save()
		c.lineWidth = tileWidth/20;
		c.strokeStyle = this.color
		c.shadowColor = this.color
		c.shadowBlur = 30
		c.strokeRect(this.x+tileWidth/40,this.y+tileWidth/40,this.Width-tileWidth/20,this.Height-tileWidth/20)
		c.font = getFont(0.2)
		c.fillStyle = this.color
		c.textAlign = "center"
		c.fillText("AGV"+this.id, this.x+this.Width/2, this.y+this.Height/2)
		c.restore()
	}
	static draw(x,y,color,Width,Height)
	{
		if(x!=null&&y!=null){
			c.beginPath()
			c.save()
			c.lineWidth = tileWidth/20;
			c.strokeStyle = color
			c.shadowColor = color
			c.shadowBlur = 30
			c.strokeRect(x+tileWidth/40,y+tileWidth/40,Width-tileWidth/20,Height-tileWidth/20)
			c.shadowBlur = 0
			c.fillStyle = color
			c.textAlign = "center"
			c.fillText("("+x/tileWidth+","+y/tileHeight+")",x+Width/2, y+Height/2)
			c.restore()
		}
		
	}
}

class Agv {
	constructor(id, x, y,state='AVAILABLE') {
		this.id= id
		this.x = x*tileWidth
		this.y = y*tileHeight
		this.color = "#50C878"
		this.state = state
		this.angle=0
		this.velocity=0
		this.hover = false
		this.selected = false
		this.tileWidth=tileWidth
		this.tileHeight=tileHeight
		this.destination = new Destination(this.id,this.x,this.y,this.tileWidth,this.tileHeight)
		this.super = false
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
		c.font = getFont(0.2)
		c.fillStyle = "white"
		c.textAlign = "center"
		c.fillText("AGV"+this.id, this.x+tileWidth/2, this.y+tileHeight/2)
		c.font = getFont(0.12)
		c.fillText(this.state,this.x+tileWidth/2, this.y+tileHeight/2+15)
	}


	update() {
		if(this.state!='UNAVAILABLE') {
			this.angle = Math.atan2(
			this.destination.y - this.y,
			this.destination.x - this.x
			)
			this.velocity = {
				x: Math.cos(this.angle),
				y: Math.sin(this.angle)
			}
			if(Math.hypot(this.destination.y - this.y,this.destination.x - this.x)<2)
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
				this.destination.draw()
				this.x = this.x + this.velocity.x*2
				this.y = this.y + this.velocity.y*2
			}
		}
		else {
			this.color = "red"
			this.state = 'UNAVAILABLE'
		}
		this.draw()
	}
}

class SuperAgv {
	constructor(id,agv1,agv2,state='AVAILABLE')
	{
		this.agv1=((agv1.x<agv2.x)||(agv1.y<agv2.y))?agv1:agv2
		this.agv2=(this.agv1==agv1)?agv2:agv1
		this.id=id
		this.x=this.agv1.x
		this.y=this.agv1.y
		this.x2=this.agv2.x
		this.y2=this.agv2.y
		this.color="#50C878"
		this.state=state
		this.angle=0
		this.velocity=0
		this.hover = false
		this.selected = false
		this.super = true
		if(agv1.x!=agv2.x)
		{
			this.tileWidth=2*tileWidth
			this.tileHeight=tileHeight
			
		}
		else{
			this.tileHeight=2*tileHeight
			this.tileWidth=tileWidth
		}
		this.destination = new Destination(this.id,this.x,this.y,
											this.tileWidth,this.tileHeight)
		removeAgv(agvs,agv1)
		removeAgv(agvs,agv2)
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
		c.lineWidth = this.tileWidth/5;
		c.strokeRect(this.x+(this.tileWidth/10), this.y+(this.tileWidth/10), this.tileWidth-this.tileWidth/5, this.tileHeight-this.tileWidth/5);
		c.fillRect(this.x+(this.tileWidth/10), this.y+(this.tileWidth/10), this.tileWidth-this.tileWidth/5, this.tileHeight-this.tileWidth/5);
		c.restore()
		c.font = getFont(0.2)
		c.fillStyle = "white"
		c.textAlign = "center"
		c.fillText("AGV"+this.agv1.id+"+"+this.agv2.id, this.x+this.tileWidth/2, this.y+this.tileHeight/2)
		c.font = getFont(0.12)
		c.fillText(this.state,this.x+this.tileWidth/2, this.y+this.tileHeight/2+15)
	}

	update() {
		if(this.state!='UNAVAILABLE') {
			this.angle = Math.atan2(
			this.destination.y - this.y,
			this.destination.x - this.x
			)
			this.velocity = {
				x: Math.cos(this.angle),
				y: Math.sin(this.angle)
			}
			if(abs(Math.hypot(this.destination.y - this.y,this.destination.x - this.x))<2)
			{
				this.color = "#50C878"
				this.state = 'AVAILABLE'
				this.x = this.destination.x
				this.y = this.destination.y
				if(Math.abs(this.x2-this.x)>1){
					this.x2=this.x+Math.sign(this.x2-this.x)*tileWidth
				}
				else{
					this.x2=this.x
				}
				if(Math.abs(this.y2-this.y)>1){
					this.y2=this.y+Math.sign(this.y2-this.y)*tileHeight
				}
				else{
					this.y2=this.y
				}
			}
			else
			{
				this.color = "#FFE338"
				this.state = 'IN USE'
				this.destination.draw()
				this.x = this.x + this.velocity.x*2
				this.y = this.y + this.velocity.y*2
				this.x2 = this.x2 + this.velocity.x*2
				this.y2 = this.y2 + this.velocity.y*2
			}
		}
		else {
			this.color = "red"
			this.state = 'UNAVAILABLE'
		}
		this.draw()
	}
}

var agv1 = new Agv(1, 2, 2)
var agv2 = new Agv(2, 3, 2)
var agv3 = new Agv(3, 2, 5,'UNAVAILABLE')
var agv4 = new Agv(4, 2, 7)
var agvs = [agv1,agv2,agv3,agv4]

var hoverX=null
var hoverY=null
var hoverColor=null

function drawMatrix() {
	c.save()
	c.strokeStyle = 'black'
	c.strokeRect(0, 0, canvas.width, canvas.height);
	c.strokeStyle = 'grey'
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
	c.restore()
}

function checkNeighbors(mode,agv) {
	var flag=false
	var agv1=null
	agvs.some(function(agv2) {
		if((Math.abs(agv2.x-agv.x)==tileWidth&&(agv2.y==agv.y))||(Math.abs(agv2.y-agv.y)==tileHeight&&(agv2.x==agv.x))) {
			if(!agv2.super&&!agv.super&&agv.state!='UNAVAILABLE'&&agv2.state!='UNAVAILABLE'){
				agv1=agv2
				flag=true
			}
		}
	})
	return (mode==1)?agv1:(flag)
}

function removeAgv(agvs, agv){
    var i = agvs.length;
    while(i--){
       if(agvs[i] == agv) { 
           agvs.splice(i,1);
       }
    }
    return agvs;
}

function destroyAgv(agv)
{
	if(agv.super){
		var agv1 = new Agv(agv.agv1.id,agv.x/tileWidth,agv.y/tileHeight,agv.state)
		var agv2 = new Agv(agv.agv2.id,agv.x2/tileWidth,agv.y2/tileHeight,agv.state)
		return [agv1,agv2]

	}
}
function animate() {
	requestAnimationFrame(animate)
	c.clearRect(0,0,canvas.width,canvas.height)
	drawMatrix()
	let hover = false
	let width=tileWidth,
	height=tileHeight
	agvs.forEach((agv) => {
		if(agv.selected&&agv.super){
			width=agv.tileWidth
			height=agv.tileHeight
		}
		agv.update()
		if(agv.hover)
			hover = true
	info.style.visibility=(hover&&(menuNode.style.display!='initial'))?"visible":"hidden";
	})
	Destination.draw(hoverX,hoverY,hoverColor,width,height)
}

var one_selected=false;

addEventListener('click', (event) =>  
	{
		var rect = canvas.getBoundingClientRect(),
        mx = event.clientX - rect.left,
        my = event.clientY - rect.top,
        xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth),
		yIndex = Math.round((my - tileWidth * 0.5) / tileHeight);

		if(mx<0||my<0||mx>canvas.width||my>canvas.height){
			return;
		}
        var x = xIndex * tileWidth,
         	y = yIndex * tileHeight;

		agvs.forEach((agv) => {
			if((agv.x==x&&agv.y==y)&&(agv.state=='AVAILABLE')){
				if(agv.selected&&one_selected)
				{
					agv.selected=false
					one_selected=false
				}
				else if(!one_selected) {
					agv.selected=true
					one_selected=true
				}
			}
			else {
				if(agv.selected){
					var flag=true;
					if(isOccupied)
					{
						flag=false
					}
					if(flag){
						console.log("Enter")
						agv.destination.x=Math.floor(x)
						agv.destination.y=Math.floor(y)
						agv.selected=false
						one_selected=false
					}
				}	
			}

		})
	})


var isOccupied=false


canvas.onmousemove = function(event) {
	var rect = canvas.getBoundingClientRect(),
        mx = event.clientX - rect.left,
        my = event.clientY - rect.top,
        xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth),
		yIndex = Math.round((my - tileHeight * 0.5) / tileHeight);

        var x = xIndex * tileWidth,
         	y = yIndex * tileHeight,
         	isSelected=false,
         	isSuper=false,
         	selX=null,
         	selY=null;
         	isOccupied=false;
         	var selected_sagv=null;
        agvs.forEach((agv) => {
        	if(agv.super&&agv.selected){
        		selected_sagv=agv
        		isSuper=true
        		if(((agv.y==agv.y2)&&((x+agv.tileWidth)>canvas.width+1))||((agv.x==agv.x2)&&((y+agv.tileHeight)>canvas.height+1)))
        		{
        			isOccupied=true
        		}
        	}
        	if(agv.selected||agv.hover){
	        	info.innerHTML = "AGV "+agv.id+"<br>X:"+Math.round(agv.x/tileWidth)+"<br>Y:"+Math.round(agv.y/tileHeight);
				info.style.left = rect.left+agv.x+tileWidth+'px';
				info.style.top = rect.top+agv.y+tileHeight+'px';
				if(agv.selected){
					agv.color = "#73D393"
				}
        	}

        })
        agvs.forEach((agv) => {
        	if(agv.super){
					agv.hover=(x==agv.x2&&y==agv.y2)
					if(((x==agv.x2&&y==agv.y2)||(x==agv.destination.x2&&y==agv.destination.y2))&&(!isSuper)){
						isOccupied=true
					}
				}
			if(isSuper&&selected_sagv!=null){
				if(!agv.selected){
					if((((agv.x-x)==tileWidth)&&y==agv.y)&&(selected_sagv.y==selected_sagv.y2)){
						isOccupied=true
					}
					else if((((agv.y-y)==tileHeight)&&x==agv.x)&&(selected_sagv.x==selected_sagv.x2)){
						isOccupied=true
					}
				}
			}
			agv.hover=(x==agv.x&&y==agv.y)
			if((x==agv.x&&y==agv.y)||(x==agv.destination.x&&y==agv.destination.y)){
				isOccupied=true
			}
			if(agv.selected==true)
			{
				isSelected=true
				selX=agv.x
				selY=agv.y

			}
		})
		if(isSelected){
			hoverX=x
			hoverY=y
			hoverColor="#398AD7"
			if(isOccupied){
				hoverColor=(x==selX&&y==selY)?'rgba(0,0,0,0)':"red"
			}
		}
		else{
			hoverY=null
			hoverX=null
		}

}

var info = document.getElementById("info")
info.style.width=tileWidth
var menuNode = document.getElementById('menu');
menuNode.style.width=tileWidth
document.getElementById('enable').addEventListener('click', () => {
	var state=document.getElementById("enable").innerHTML
	var r = canvas.getBoundingClientRect()
	agvs.forEach((agv) => {
		if((agv.x==Math.ceil(parseInt(menuNode.style.left)-r.left-tileWidth))&&(agv.y==Math.ceil(parseInt(menuNode.style.top)-r.top - tileHeight)))
		{
			if(state=='Enable')
			{
				agv.state='AVAILABLE'
			}
			else{
				agv.state='UNAVAILABLE'
			}
		}
	})
});

document.getElementById('dock').addEventListener('click', () => {
	var flag=true
	var mode=document.getElementById('dock').innerHTML
	var r = canvas.getBoundingClientRect()
	if(mode=='Dock')
	{
		agvs.forEach((agv) => {
			if((agv.x==Math.ceil(parseInt(menuNode.style.left)-r.left-tileWidth))&&agv.y==Math.ceil((parseInt(menuNode.style.top) - r.top - tileHeight)))
			{
				if(flag){
					var agv2=checkNeighbors(1,agv)
					if(agv2!=null)
					{
						var sagv=new SuperAgv(1,agv,agv2)
						agvs.push(sagv)
					}
					flag=false
				}
			}
		})
	}
	else{
		agvs.forEach((agv) => {
			if((agv.x==Math.ceil(parseInt(menuNode.style.left)-r.left-tileWidth))&&(agv.y==Math.ceil(parseInt(menuNode.style.top) - r.top - tileHeight)))
			{
				if(agv.super){
					var agv1 = destroyAgv(agv)
					removeAgv(agvs,agv)
					agvs.push(agv1[0])
					agvs.push(agv1[1])
					document.getElementById("dock").innerHTML='Dock'

				}
			}
		})

	}
	
});

window.addEventListener('click', () => {
        menuNode.style.display = 'none';
      });


canvas.addEventListener('contextmenu', function(event) {
	event.preventDefault()
	info.style.visibility="hidden"
	var rect = canvas.getBoundingClientRect(),
        mx = event.clientX - rect.left,
        my = event.clientY - rect.top,
        xIndex = Math.round((mx - tileWidth * 0.5) / tileWidth),
		yIndex = Math.round((my - tileHeight * 0.5) / tileHeight);

    var x = xIndex * tileWidth,
     	y = yIndex * tileHeight,
     	isSuper=false
     	neighbor=false;
     	valid = false;
     	state = null;
    var superSelected=false;

	agvs.forEach((agv) => {
		if(agv.x==x&&agv.y==y){
			valid=true
			state=agv.state
			neighbor=checkNeighbors(0,agv)
			isSuper=agv.super
			if(agv.super&&agv.hover){
				superSelected=true
			}
		}
	})
	if(!valid){
		return;
	}
	if(state=='AVAILABLE')
	{
		document.getElementById("enable").innerHTML='Disable'
	}
	else if(state=='UNAVAILABLE')
	{
		document.getElementById("enable").innerHTML='Enable'
	}
	if(neighbor||isSuper){
		document.getElementById("dock").disabled=false
	}
	else{
		document.getElementById("dock").disabled=true
	}
	if(isSuper)
	{
		if(state=='UNAVAILABLE')
		document.getElementById("dock").disabled=true
		if(superSelected)
		document.getElementById("dock").innerHTML = "Undock"
	}
	menuNode.style.display = 'initial';
	menuNode.style.left = rect.left+x+tileWidth+'px';
	menuNode.style.top = rect.top+y+tileHeight+'px';
})

animate()
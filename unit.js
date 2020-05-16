const TAU = 2 * Math.PI;
const DEFAULT_HP = 10;
const DEFAULT_ATTACK = 10;
const DEFAULT_DEFENSE = 10;
const DEFAULT_COLOR = "gray";
const DEFAULT_SIZE = 8;

function Unit(x, y, color, r=DEFAULT_SIZE) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vx = 0;
  this.vy = 0;
  this.maxv = 1;
  this.target = {x: this.x, y: this.y};
  this.color = color;
  this.selected = false;
  this.field = getField(Math.floor(this.y/B), Math.floor(this.x/B));
  this.direction = 0.0 * Math.PI;

  this.type = "SOLDIER";     // one of SOLDIER, ARCHER
  this.name = this.color + this.type + this.x + this.y; 
  this.hp = DEFAULT_HP;
  this.attack = DEFAULT_ATTACK;
  this.defense = DEFAULT_DEFENSE;

  this.state = "INACTIVE";    // one of INACTIVE, MOVING, ATTACKING
  
  this.getLocation = function() {
    return {x: this.x, y: this.y};
  }

  this.contains = function(x,y) {
    //square collision
    let dx = Math.abs(this.x - x)
    if (dx > this.r) return false;
    let dy = Math.abs(this.y - y)
    if (dy > this.r) return false;
    return true;
  }

  this.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, this.direction+0.10*TAU, this.direction+TAU-0.10*TAU);
    ctx.lineTo(this.x, this.y);
    ctx.fill();
    if (this.selected) {
      ctx.strokeStyle = "yellow";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, TAU);
      let temp = ctx.lineWidth;
      ctx.lineWidth = 4
      ctx.stroke();
      ctx.lineWidth = temp;
    }
    if (this.state == "ATTACKING") {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, TAU);
      let temp = ctx.lineWidth;
      ctx.lineWidth = 6
      ctx.stroke();
      ctx.lineWidth = temp;
    }
  }

  this.getFieldVector = function(i, j) {
    let vec = {x:0, y:0};
    if (mapContains(i,j)){
      if (map[i][j] == 0) {
        vec = this.field[i][j].v;
      } else {
        vec = {
          x: this.x - (B*j + B/2),
          y: this.y - (B*i + B/2)
        }
      }
    }
    return vec;
  }

  this.update = function() {
    if (withinGridSpace(this.getLocation(), this.target)) {
      if (closeToPts(this.getLocation(), this.target)) {
        this.vx = 0;
        this.vy = 0;
        return
      }
      let dx = this.target.x - this.x;
      let dy = this.target.y - this.y;
      let hyp = Math.sqrt(dx*dx + dy*dy);
      dx /= hyp;
      dy /= hyp;
      this.vx = dx * this.maxv;
      this.vy = dy * this.maxv;
      this.x += this.vx;
      this.y += this.vy;

      return
    }

    let fj = Math.floor((this.x - this.r)/ B);
    let fi = Math.floor((this.y - this.r)/ B);
    let cj = Math.ceil((this.x - this.r)/ B);
    let ci = Math.ceil((this.y - this.r)/ B);
    
    let v1 = this.getFieldVector(fi, fj);
    let v2 = this.getFieldVector(fi, cj);
    let v3 = this.getFieldVector(ci, fj);
    let v4 = this.getFieldVector(ci, cj);

    let xWeight = (this.x - this.r)/ B - fj;
    let topx = v1.x * (1-xWeight) +  v2.x * xWeight;
    let topy = v1.y * (1-xWeight) +  v2.y * xWeight;
    let botx = v3.x * (1-xWeight) +  v4.x * xWeight;
    let boty = v3.y * (1-xWeight) +  v4.y * xWeight;
    
    let yWeight = (this.y - this.r)/ B - fi;

    let dirx = topx * (1-yWeight) + botx * yWeight;
    let diry = topy * (1-yWeight) + boty * yWeight;

    let hyp = Math.sqrt(dirx*dirx + diry*diry)

    if (!closeTo(hyp,0)){
      this.vx = dirx / hyp;
      this.vy = diry / hyp;
    }
    this.vx *= this.maxv;
    this.vy *= this.maxv;

    this.x += this.vx;
    this.y += this.vy;
    
    this.direction = Math.atan2(this.vy, this.vx);
    console.log(this.direction, this.x, this.y);
  }
}

function closeTo(a, b) {
  return Math.abs(a-b) <= .01;
}

function closeToPts(pt1, pt2) {
  return closeTo(pt1.x, pt2.x) && closeTo(pt1.y, pt2.y);
}

function withinGridSpace(pt1, pt2) {
  let i1 = Math.floor(pt1.y/ B);
  let i2 = Math.floor(pt2.y/ B);
  if (i1 != i2) return false;
  let j1 = Math.floor(pt1.x/ B);
  let j2 = Math.floor(pt2.x/ B);
  if (j1 != j2) return false;
  return true;
}

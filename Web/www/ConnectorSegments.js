// Requires three.js

function ConnectorSegments(parent, target = new THREE.Vector(0, 0, 0), color = 0xffffff)
{
    this.parent = parent;
    this.target = target;
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3());
    // g.vertices.push(new THREE.Vector3(0, target.y - parent.position.y, target.z - parent.position.z));
    g.vertices.push(target.clone().sub(parent.position));
    var m = new THREE.LineBasicMaterial({color:color});
    this.object = new THREE.Line(g, m);
}

ConnectorSegments.prototype.update = function()
{
    // this.object.geometry.vertices[1].y = this.target.y - this.parent.position.y; 
    // this.object.geometry.vertices[1].y = this.target.z - this.parent.position.z;
    // this.object.geometry.vertices[2] = this.target.clone().sub(this.parent.position);
    this.object.geometry.vertices[1] = this.target.clone().sub(this.parent.position);
    this.object.geometry.verticesNeedUpdate = true;
}

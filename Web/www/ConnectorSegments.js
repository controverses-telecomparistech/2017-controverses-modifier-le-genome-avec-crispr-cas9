// Requires three.js

function ConnectorSegments(parent, target = new THREE.Vector(0, 0, 0), color = 0xffffff)
{
    this.parent = parent;
    this.target = target;
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3());
    g.vertices.push(new THREE.Vector3(0, target.y - parent.position.y, target.z - parent.position.z));
    g.vertices.push(target.clone().sub(parent.position));
    var m = new THREE.LineBasicMaterial({color:color});
    this.object = new THREE.Line(g, m);
}

ConnectorSegments.prototype.update = function ()
{
    var a = this.object.geometry.vertices;
    a[1].y = target.y - parent.y;
    a[2].set(target.x - parent.position.x, target.y - parent.position.y, target.z - parent.position.z);
    this.object.geometry.verticesNeedUpdate = true;
}
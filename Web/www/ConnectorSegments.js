// Requires three.js

// Trace une ligne entre un objet parent et une cible (Vector3 target)
function ConnectorSegments(parent, target = new THREE.Vector(0, 0, 0), color = 0xffffff)
{
    this.parent = parent;
    this.target = target;
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3());
    g.vertices.push(target.clone().sub(parent.position));
    var m = new THREE.LineBasicMaterial({color:color});
    this.object = new THREE.Line(g, m);
}

ConnectorSegments.prototype.update = function()
{
    this.object.geometry.vertices[1] = this.target.clone().sub(this.parent.position);
    this.object.geometry.verticesNeedUpdate = true;
}

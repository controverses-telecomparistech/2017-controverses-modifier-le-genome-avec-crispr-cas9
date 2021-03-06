$(document).ready(function ()
{
    var container, renderer, scene, camera, mesh, mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster(); // pour détecter quel objet est sous la souris
    var dialogBoxes = [], segments = []; // pour maintenir les ConnectorSegments et les mettre à jour
    var canvases = [];
    // Quelques constantes
    var TEXT_SIZE = 150;
    var BOX_NUM = 5;
    var BOX_ROTATION_SPEED = 0.01, HALF_MESH_NUM = 10, MESH_WIDTH = 11.03, MESH_HEIGHT = 5.7, MESH_DEPTH = -85, MESH_ROTATION = 0.6, BASE_MESH_COLOR_HEX;
    var COLORED_MESH = [2, 6, 10, 14, 18], X_FACTOR_MESH = [0, -0.5, 1, 0.5, 0], ROTATION_FACTOR_BOX = [-1, 1, -1, 1, -1];
    var CANVAS_TO_BOX_FACTOR = 40;
    // Constantes pour la taille des boîtes cliquables
    var box_width = 40, box_height = 10, box_depth = MESH_DEPTH;
    var box_bgcolor = "#cccccc", box_texts = [ "Entretiens", ["Expertise", "scientifique"], "Presse & Média", "Politique & droit", "Vue d'ensemble" ];

    // Trouve toutes les boîtes actuellement sous la souris ; retourne un tableau
    function raycastMouse()
    {
        raycaster.setFromCamera(mouse, camera);
        // Test récursif sur les boîtes uniquement (objets dont les noms commencent par "Box")
        var a = dialogBoxes.map(group => group.children.filter(obj => obj.name.split(" ")[0] == "Box")[0]);
        return raycaster.intersectObjects(a);
    }

    initScene();
    drawCanvases();
    animate();

    function initScene()
    {
        container = document.getElementById("renderer");
        // Moteur de rendu de three.js
        renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
        renderer.setSize(container.offsetWidth, container.offsetHeight, false);
        // renderer.setSize(500, 500);
        container.appendChild(renderer.domElement);

        // Scène 3D dans laquelle on va mettre tous les objets
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        camera.position.z = 10;
        scene.add(camera);

        // Une source de lumière
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
        dirLight.position.set(-3, 3, 7);
        dirLight.position.normalize();
        scene.add(dirLight);

        // Voire deux, pourquoi pas
        var pointLight = new THREE.PointLight(0xffffff, 5, 50);
        pointLight.position.set(10, 20, -10);
        scene.add(pointLight);

        // Ajout du gros modèle 3D d'ADN
        // ! Le chargement est asynchrone !
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load("data/dna.json", function(geometry, materials)
            {
                BASE_MESH_COLOR_HEX = materials[0].color.getHex();
                mesh = new THREE.Group();
                for(var i = -HALF_MESH_NUM; i <= HALF_MESH_NUM; i++)
                {
                    var m = new THREE.Mesh(geometry, materials[0].clone());
                    m.position.y = i * MESH_HEIGHT;
                    m.rotation.y = i * Math.PI / 4;
                    mesh.add(m);
                }
                mesh.rotation.order = "ZXY";
                mesh.rotation.z = MESH_ROTATION;
                mesh.position.z = MESH_DEPTH; // distance respectable, c'est que le modèle est plutôt gros
                // setupControls();
                scene.add(mesh);
            });

        // Ajout de quelques boîtes cliquables pour les liens des pages
        // Boîte
        var geom = new THREE.PlaneGeometry(box_width, box_height);
        // Contour de la boîte
        var outline_geom = new THREE.Geometry();
        outline_geom.vertices.push(new THREE.Vector3(-box_width / 2, box_height / 2, 0));
        outline_geom.vertices.push(new THREE.Vector3(box_width / 2, box_height / 2, 0));
        outline_geom.vertices.push(new THREE.Vector3(box_width / 2, -box_height / 2, 0));
        outline_geom.vertices.push(new THREE.Vector3(-box_width / 2, -box_height / 2, 0));
        outline_geom.vertices.push(new THREE.Vector3(-box_width / 2, box_height / 2, 0));
        var outline_mat = new THREE.LineBasicMaterial({color:0x888888, linewidth:5});

        // On construit les Mesh des boîtes
        // On va afficher le texte sur un canvas qui sera ensuite utilisé comme texture par la boîte
        for(var i = 0; i < BOX_NUM; i++)
        {
            canvases[i] = document.createElement("canvas");
            canvases[i].width = box_width * CANVAS_TO_BOX_FACTOR;
            canvases[i].height = box_height * CANVAS_TO_BOX_FACTOR;
            dialogBoxes[i] = new THREE.Group();

            // Les noms de toutes les boîtes commencent par "box" pour les retrouver plus tard
            var mat = new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvases[i]), side:THREE.DoubleSide});
            var m = new THREE.Mesh(geom, mat);
            m.name = "Box " + (i + 1);
            dialogBoxes[i].add(m);
            dialogBoxes[i].add(new THREE.Line(outline_geom, outline_mat));
            // On place la boîte au hasard dans le champ de vision de la caméra
            var p = new THREE.Vector3();
            // léger écart en profondeur pour que les boîtes se chevauchent
            p.set((MESH_WIDTH + box_width / 2) * X_FACTOR_MESH[i], (COLORED_MESH[i] - HALF_MESH_NUM) * MESH_HEIGHT, box_depth - i);
            dialogBoxes[i].position.set(p.x, p.y, p.z);
            scene.add(dialogBoxes[i]);
        }
        // On fait en sorte que les boîtes réagissent au clic
        renderer.domElement.addEventListener("mouseup", mouseup);
        // et qu'elles illuminent la boîte qui va bien
        renderer.domElement.addEventListener("mousemove", updateMouse);
        // sans pour autant les allumer pour rien
        renderer.domElement.addEventListener("mouseleave", mouseLeft);

        // Appelé quand l'utilisateur relâche le clic gauche
        function mouseup(event)
        {
            if(event.button == 0) // clic gauche, cf specs MouseEvent HTML5
            {
                var intersects = raycastMouse();
                if(intersects.length > 0)
                {
                    var n = intersects[0].object.name.split(" ");
                    document.getElementById("Box" + n[1]).click();
                }
            }
        }
        
        // Met à jour les coordonnées de la souris
        function updateMouse(event)
        {
            var rect = event.target.getBoundingClientRect();
            mouse.x = (event.clientX - rect.left) / rect.width * 2. - 1.;
            mouse.y = -(event.clientY - rect.top) / rect.height * 2. + 1.;
        }
        
        // Positionne la souris hors du conteneur pour ne pas allumer l'ADN sans raisons
        function mouseLeft(event)
        {
            mouse.x = mouse.y = -10000;
        }
    }

    // On dessine le texte des canvas
    function drawCanvases()
    {
        requestAnimationFrame(drawCanvases);
        for(var i = 0; i < BOX_NUM; i++)
        {
            var ctx = canvases[i].getContext("2d");
            ctx.font = TEXT_SIZE + "px Nunito Sans";
            ctx.fillStyle = box_bgcolor;
            ctx.fillRect(0, 0, canvases[i].width, canvases[i].height);
            ctx.fillStyle = "#000000";
            if(typeof box_texts[i] === "string")
            {
                var w = ctx.measureText(box_texts[i]).width;
                ctx.fillText(box_texts[i], (canvases[i].width - w) / 2, (canvases[i].height + TEXT_SIZE / 2) / 2);
            }
            else
            {
                // On a deux strings, c'est "Expertise scientifique"
                var text_y = (canvases[i].height - TEXT_SIZE / 2) / 2;
                for(var j = 0; j < 2; j++)
                {
                    var w = ctx.measureText(box_texts[i][j]).width;
                    ctx.fillText(box_texts[i][j], (canvases[i].width - w) / 2, text_y);
                    text_y += TEXT_SIZE;
                }
            }
        }
    }
    
    // Fonction appelée à chaque rafraîchissement d'écran
    function animate()
    {
        requestAnimationFrame(animate);
        // Si les dimensions du conteneur ont changé, on met à jour des dimensions du render
        var dims = renderer.getSize();
        if(dims.width != container.offsetWidth || dims.height != container.offsetHeight)
        {
            renderer.setSize(container.offsetWidth, container.offsetHeight, false);
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
        }
        // On attend que le modèle 3D soit chargé (chargement asynchrone)
        if(mesh)
        {
            // Petite rotation des familles
            mesh.rotation.y += BOX_ROTATION_SPEED;
            // On initialise les ConnectorSegments s'il le faut
            if(segments.length < 1)
            {
                for(var i = 0; i < BOX_NUM; i++)
                {
                    var target = new THREE.Vector3(0, (COLORED_MESH[i] - HALF_MESH_NUM) * MESH_HEIGHT, MESH_DEPTH);
                    target.applyEuler(mesh.rotation);
                    segments[i] = new ConnectorSegments(dialogBoxes[i], target, 0);
                    segments[i].object.rotation.order = mesh.rotation.order;
                    dialogBoxes[i].add(segments[i].object);
                }
            }
            // Il y a autant de ConnectorSegments que de dialogBoxes
            for(var i = 0; i < BOX_NUM; i++)
            {
                dialogBoxes[i].position.sub(segments[i].target);
                dialogBoxes[i].position.applyAxisAngle(new THREE.Vector3(-Math.sin(MESH_ROTATION / 2), Math.cos(MESH_ROTATION / 2), 0.), BOX_ROTATION_SPEED * ((i % 2) * 2 - 1));
                dialogBoxes[i].position.add(segments[i].target);
                segments[i].update();
            }
            // On réinitialise les couleurs des branches d'ADN
            var meshes = mesh.children;
            for(var i = 0; i < meshes.length; i++)
                meshes[i].material.color.setHex(BASE_MESH_COLOR_HEX);
            // et on colorie celle dont la boîte est sous la souris
            var intersects = raycastMouse();
            for(var i = 0; i < intersects.length; i++)
            {
                var index = intersects[i].object.name.split(" ")[1] - 1;
                var m = meshes[COLORED_MESH[index]];
                m.material.color.setHex(0xff0000);
            }
        }
        render();
    }

    function render()
    {
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
});
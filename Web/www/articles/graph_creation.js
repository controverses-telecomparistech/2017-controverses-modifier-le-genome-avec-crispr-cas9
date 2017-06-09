function createGraph(file, container)
{
    var s = new sigma({
        container: container,
        renderer: {
            container: document.getElementById(container),
            type: 'webgl'
        },
        settings: {
            minNodeSize: 8,
            maxNodeSize: 16
        }
    });
    
    sigma.parsers.gexf('data/' + file, s, function ()
        {
            var nodes = s.graph.nodes();
            
            for(var nodeId in nodes)
            {
                if(nodes[nodeId].id != "0")
                    nodes[nodeId].hidden = true;
            }
            s.refresh();
            
            // On affiche les divs quand on clique sur les noeuds
            s.bind("clickNode", function (e)
                {
                    currentDiv = $("#" + e.data.node.id);
                    if(currentDiv[0])
                    {
                        currentDiv.addClass("current");
                    }
                    else // s'il n'y a pas d'article, on révèle les voisins
                    {
                        var n = s.graph.neighbors(e.data.node.id);
                        for(var nodeId in n)
                        {
                            s.graph.invertNodeHidden(n[nodeId].id);
                        }
                        s.refresh();
                    }
                }
            ).bind("click", function ()
                {
                    if(currentDiv)
                    {
                        currentDiv.removeClass("current");
                        currentDiv = undefined;
                    }
                }
            );
        }
    );
}

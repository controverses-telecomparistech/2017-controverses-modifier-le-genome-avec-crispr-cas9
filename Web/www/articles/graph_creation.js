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
      s.refresh();
      // On affiche les divs quand on clique sur les noeuds
      s.bind("clickNode",
        function (e)
        {
          currentDiv = $("#" + e.data.node.id);
          if(currentDiv)
          {
            currentDiv.addClass("current");
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
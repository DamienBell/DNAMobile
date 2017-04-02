function __resolveOrientation( angle) {
    // http://www.williammalone.com/articles/html5-javascript-ios-orientation/
    angle = Math.abs( angle);
    return ( angle === 90) ? "landscape" : "portrait";
}

function getOrientation() {
    let orientation = "";
    if ( window.screen && window.screen.orientation && window.screen.orientation.type) {
        orientation = window.screen.orientation.type;
        // string replace
        orientation = orientation.replace( "-primary", "");
    }
    // 0 is a "falsy" value
    if ( window.orientation || window.orientation === 0) {
        orientation = __resolveOrientation( window.orientation);
    }
    return orientation;
}

//Vue Modal
// register modal component
Vue.component('modal', {
  template: '#modal-template'
});

// start app
var InfoModal = new Vue({
  el: '#active-modal',
  props: {
    showModal: Boolean,
    info: Object,
    styleObject: Object,
    color: String
  },
  data: {
    showModal: false,
    color: "#CCC"
  },
  computed: {
    percent: function(){
      if(this.info){
        if(this.info.percent_overall){
          return (this.info.percent_overall * 100).toFixed(2);
        }
      }
      return 0;
    },
    score: function(){
      if(this.info && this.info.total){
        return (this.info.total * 100).toFixed(2);
      }
      return 0;
    },
    styleObject: function(){
      if(this.color){
        return {color: this.color};
      }
      return {color: "#ccc"};
    }
  }
});

var currNode = null;
var identifier = null;
var tree = null;

// populate from categories.json
var children = [];
var i = 1;
for (var key of Object.keys( categories)) {
        let category = categories[ key];
        category.category = key;
        let count = category.count;
        children.push({ id: key,
                         value: count,
                        percentage: category.percent_overall,
                        total: category.total,
                        info: category
                      });
        i = i+1;
}

var data = { "name": "rect", "children": children};
var svg = d3.select( "svg");

function closeGraph() {
    let container = document.getElementById( "container");
    container.style.transformOrigin = "right top";
    container.style.transitionDuration = "3s";
    container.style.transform = "scale( 0.10, 0.10)";
}

function expandNodeDetails(node){
  let $elem      = $(node.node());
  let background = $elem[0].style.background
  let position   = $elem.position()
  let height     = $elem.height();
  let width      = $elem.width();
  let info       = node.data()[0].data.info;

  InfoModal.info      = node.data()[0].data.info;
  //InfoModal.color     = d3.color(info.total);
  InfoModal.showModal = true;
}

function didTapNode(d){
  expandNodeDetails(d3.select( this));
}

function onTouch( d) {
    console.log( "onTouch: " + d);
    d3.event.preventDefault();

    let node = d3.select( this);

    if ( identifier !== node.node().id) {
        // descale old node
        if ( currNode) {
            currNode.classed( "node", true).classed( "scalable", false);
        }

        // swap and scale new node
        currNode = node;
        identifier = node.node().id;
        console.log( "new node- " + identifier);
        currNode.classed( "node", true).classed( "scalable", true);
    }
}

function draw() {
    var width =  window.innerWidth,
    height = window.innerHeight
    svg = svg.attr( "width", width)
        .attr( "height", height);

    let color = d3.scaleOrdinal( d3.schemeCategory20c);

    var treemap = d3.treemap()
    .tile( d3.treemapResquarify)
    .size( [width, height])
    .round( true)
    .paddingInner( 5);

    // global
    tree = d3.hierarchy( data);
    // sum before we pass to treemap()
    tree.sum( function(d) { return d.value; });
    treemap( tree);

    d3.select("#container")
    .selectAll(".node")
    .data( tree.leaves())
    .enter()
    .append("div")
    .attr("class", "node")
    .attr("id", function( d){ return d.data.id; })
    .attr("title", function(d) { return d.data.id; })
    .style("left", function(d) { return d.x0 + "px"; })
    .style("top", function(d) { return d.y0 + "px"; })
    .style("width", function(d) { return d.x1 - d.x0 + "px"; })
    .style("height", function(d) { return d.y1 - d.y0 + "px"; })
    // touch events
    .on("touch", didTapNode)
    // click
    .on( "click", didTapNode)
    // color via d.data.total
    .style("background", function(d) {
          return color( d.data.total);
    })
    // text
    .append( "div")
    .attr("class", "text-node")
    .text( function( d) { return d.data.id; });

    function onMsgClick() {

        let container = document.getElementById( "container");
        container.style.transformOrigin = "right top";
        container.style.transitionDuration = "3s";
        container.style.transform = "scale( 0.10, 0.10)";
    }
    // UI
    let msgP = document.getElementById("orientation");
    msgP.textContent = getOrientation();
    console.log( getOrientation());
}

function animate( index, nodes) {
    for( var j = 0; j < nodes.length; j++) {
        nodes[ j].className = "node opacity-light";
    }

    if (index < nodes.length) {
        let n = nodes[ index];
        n.className = "node scalable";

        let msg = document.getElementById( "msg");
        msg.textContent = nodes[ index].id;
    }
}

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle( array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// orientation change
window.addEventListener( "orientationchange", function() {
    // TODO: with appropriate expire headers - a reload won't hit the server again!
    // hack to force page reload (and thus proper d3 scaling)
    location.reload();
});

// resize
window.addEventListener( "resize", function() {
    // TODO: only relevant for Desktop resizing
    // iOS Safari seems to have a bug which infinitely calls this event
});

window.addEventListener( "load", function() {
    // main
    draw();
});

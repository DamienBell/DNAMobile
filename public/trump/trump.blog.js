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

Vue.component('share-component', {
  template: '#share-template',
  props: {
    url: String,
    subject: String,
  },
  computed: {
    url: function(){
      return window.location.href;
    },
    _subject: function(){
      if(this.subject){
        return this.subject
      }
      return ""
    },
    twitterUrl(){
      return `https://twitter.com/intent/tweet?original_referer=${this.url}&text=${this._subject}&url=${this.url}`;
    },
    emailUrl(){
      return `mailto:?subject=${this._subject}&body=${this.url}`
    }
  },
  methods: {
    fbShare(e){
       FB.ui({
             method: 'share_open_graph',
             action_type: 'og.likes',
             action_properties: JSON.stringify( {})
         }, function( response) {
       });
    }
  }

});


var ShareModal = new Vue({
  el: '#share-modal',
  props: {
    showModal: Boolean,
    staticURL: String,
    url: String,
    subject: String,
    size: "small"
  },
  data: {
    showModal: false,
    staticURL: null,
    url: "some value"
  },
  computed: {
    url: function(){
      if(this.staticURL){
        return staticURL;
      }
      return window.location.href;
    },
  }
});

//we'll be using a global modal, so init with empty Vue for now
var InfoModal = new Vue({
  el: '#active-modal',
  props: {
    showModal: Boolean,
    info: Object,
    styleObject: Object,
    color: String,
    classObject: Object
  },
  data: {
    showModal: false,
    color: "#CCC",
    classObject: {large: true}
  },
  computed: {
    percent: function(){
      if(this.info){
        if(this.info.percent_overall){
          return Math.round( this.info.percent_overall * 100).toFixed( 0);
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

let shareInfo = {
  subject: "Visualize: President Trump's February speech to Congress"
}
var s  = new Vue({
  el: '#static-share',
  data: shareInfo
});

//populate from categories.json
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
let TapsToTrigger = 3;
var totalTaps = 0;

function expandNodeDetails(node){
  let $elem      = $(node.node());
  let background = $elem[0].style.background
  let position   = $elem.position()
  let height     = $elem.height();
  let width      = $elem.width();
  let info       = node.data()[0].data.info;

  InfoModal.info      = node.data()[0].data.info;
  InfoModal.showModal = true;
}

function didTapNode(d){
    totalTaps = totalTaps + 1;
    // haven't already requested
    if ( totalTaps === TapsToTrigger && !Cookies.get( "have-contacted")) {
        ShareModal.show = true;
        Cookies.set( "have-contacted")
    }
    else {
        expandNodeDetails(d3.select( this));
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
    .paddingInner(1);

    let tree = d3.hierarchy( data);
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
    .attr("class", "title-node")
    .text( function( d) { return d.data.id; })
    .style("color", function(d) {
           return "black";
    })
    .append( "div")
    .attr("class", "percent-node")
    .text( function( d) {
       return Math.round( (d.data.percentage * 100)).toFixed( 0)+"%"
    })
    .style("color", function(d) {
           return "black";
    });
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

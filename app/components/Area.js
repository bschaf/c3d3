var d3 = require('d3'),
  _ = require('lodash'),
  d3_svg_line_variable = require('./d3LineVariable');

/**
 * [Area description]
 * @param {[type]} data [description]
 */

function Area(data) {
  var defaults = {
    bindTo: '#chart'
  }, settings;

  settings = _.merge(defaults, data);

  var margin, width, height, canvasHeight,
    y, x, xA, yA, color, svg;

  var CATEGORIES = {
    'capex': 'capex',
    'repo': 'repo',
    'ma': 'ma',
    'dividends': 'dividends',
    'cash': 'cash',
    'debt': 'debt'
  }

  var grps = {}, xcats = [], catsArr = [], lines = [],
    minv, maxv, maxn,
    colors = d3.scale.category20(),
    line;

  margin = {
    top: 50,
    right: 20,
    bottom: 20,
    left: 150
  };

  width = 1100 - margin.left - margin.right;
  height = 700 - margin.top - margin.bottom;
  canvasHeight = height + margin.top + margin.bottom;

  // svg = d3.select(settings.bindTo).append('svg')
  //     .attr('width', width + margin.left + margin.right)
  //     .attr('height', height + margin.top + margin.left)
  //   .append('g')
  //     .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

  function getData(callback) {
    d3.csv('../capAllocation.csv', type, function(err, rawData) {
      if (err) {
        console.log('Error parsing data: ' + err);
        return;
      }

      initDataObjs(rawData);

      setGlobalVars(rawData);

      getLineData();

      callback();
    });
  }

  function initDataObjs(rawData) {
    var categories = rawData.map(function(d) {
      return d.category;
    });
    
    categories = d3.set(categories).values();
    
    categories.forEach(function(d, i) {
      var catData = rawData
        .filter(function(r) {
          return r.category == d;
        })
        .sort(function(a, b) {
          return d3.descending(a.val, b.val);
        });
      
      grps[d] = catData;
    
      xcats.push(d);

      catsArr.push(catData);
    });

    categories = null;

    var groups = rawData.map(function(d) {
      return d.group;
    });

    groups = d3.set(groups).values();

    groups.forEach(function(d, i) {
      lines[i] = { group: d, vals: [] }
    });

    groups = null;
  }

  function setGlobalVars() {
    maxn = lines.length;

    maxv = d3.max(catsArr, function(d) { return d3.sum(d, function(n) { return n.val; }); });
    minv = d3.min(catsArr, function(d) { return d3.min(d, function(n) { return n.val; }); });

    xFactor = width / 2;

    y = d3.scale.linear()
      .domain([0, 100])
      .range([0, height]);

    wi = d3.scale.linear()
      .domain([0, 100])
      .range([1, height]);

    line = d3_svg_line_variable()
      .interpolate('basis')
      .w(function(d) { return d.w; })
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
  }

  function getLineData() {
    var grpIdx = 0,
        grpKeys = Object.keys(grps);

    for (var grp in grps) {

      var currentGrp = grps[grp],
          cumOffset = maxv; //Start at the widest cut in half

      currentGrp.forEach( function(d, i) {
        if (i == 0) cumOffset = d.val / 2;

        var segment = getSegment(d, grpIdx, cumOffset, i),
            lineConfig = lines.filter(function(l) {
              return l.group == d.group;
            });

        lineConfig = lineConfig[0].vals;
        // console.log(lineConfig);

        //Add a padding to take up gap at end
        if (grpIdx == grpKeys.length-1)
          lineConfig.push(getSegment(d, grpIdx, cumOffset, i, -5));

        lineConfig.push(segment);

        //Add a padding to take up gap at beginning
        if (grpIdx == 0)
          lineConfig.push(getSegment(d, grpIdx, cumOffset, i, 5));

        cumOffset += d.val;
      });

      grpIdx++;
    }
  }

  function getSegment(d, grpIdx, cumOffset, i) {
    var segment = {}
        // xOff = (typeof(xOffset) !== 'undefined') ? xOffset : 0;

    segment.x = grpIdx * xFactor;
    segment.y = y(cumOffset);
    segment.w = wi(d.val);

    console.log(segment.x);

    return segment;
  }

  function makeChart() {
    svg = d3.select(settings.bindTo).append('svg')
      .attr( 'width', width + margin.left + margin.right )
      .attr( 'height', height + margin.top + margin.bottom );

    // Add a label per date.
    var x = d3.scale.ordinal()
      .domain(xcats)
      .range([0.25, xFactor]);

    // Paths
    var paths = svg.selectAll('path.linegroup')
      .data(lines)
    .enter().append('svg:g')
      .attr('class', 'linegroup');
    
    paths.append('svg:path')
      .attr('class', 'line')
      .attr('d', function(d) { return line(d.vals); })
      .attr('fill', function(d) { return colors.range()[getIdxByValue(CATEGORIES, d.group)]; })
      .attr('opacity', '.8')
  }

  function getIdxByValue(obj, value) {
    var idx = 0;
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        if(obj[prop] === value)
          return idx;
        else if (idx == 19) idx = 0;
        else idx++;
      }
    }
  }

  getData(makeChart);

  function type(d) {
    d['val'] = +d.val;

    return d;
  }
}

module.exports = Area;

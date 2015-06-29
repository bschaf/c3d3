var d3 = require('d3'),
  _ = require('lodash');

/**
 * [DivergingBar description]
 * @param {[type]} data [description]
 */

function DivergingBar(data) {
  var defaults = {
    bindTo: '#chart'
  }, settings;

  settings = _.merge(defaults, data);

  var margin, width, height, canvasHeight,
    svg;

  margin = {
    top: 50,
    right: 200,
    bottom: 20,
    left: 150
  };

  width = 1200 - margin.left - margin.right;
  height = 400 - margin.top - margin.bottom;
  canvasHeight = height + margin.top + margin.bottom;

  /**
   * Main SVG Object
   */
  svg = d3.select(settings.bindTo).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.left)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

  var x = d3.time.scale()
    .rangeRound([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.months, 1)
    .tickFormat(d3.time.format('%b'))
    .tickPadding(10)
    .orient('bottom');

  var xAxis2 = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.years, 1)
    .tickFormat(d3.time.format('%Y'))
    .tickSize(0)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(4)
    .orient('right');

  /**
   * Color Scale
   */
  color = d3.scale.ordinal()
    .domain([
      'Buy',
      'Sell'
    ])
    .range([
      'green',
      'red'
    ]);

  d3.csv('../timeSeriesAnalystReco.data.contData.csv', type, function (error, data) {

    /**
     * Abstract as Manipulation
     * Up or Down to Nearest 10 / Let's make dynamic
     */
    var min_val = d3.min(data, function (d) {
      return Math.floor((d.negdiff - 1) / 10) * 10;
    });

    var max_val = d3.max(data, function (d) {
      return Math.ceil((d.posdiff + 1) / 10) * 10;
    });

    y.domain([min_val, max_val]);

    x.domain([new Date(data[0].rawdate), new Date(data[data.length - 1].rawdate)]);

    svg.append('g')
      .attr({
        'class': 'x axis',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'transform': 'translate(0,' + height + ')'
      })
      .call(xAxis);

    svg.append('g')
      .attr({
        'class': 'x axis 2',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'stroke-width': '0',
        'transform': 'translate(0,' + (height + 50) + ')'
      })
      .call(xAxis2);

    svg.append('g')
      .attr({
        'class': 'y axis ',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'stroke-width': '0',
        'transform': 'translate(' + width + ', 0)'
      })
      .call(yAxis);

    /**
     * y Axis Grid Lines
     * ticks() should be a constant
     * crete manipulation for steps/increments?
     */
    var yAxisGrid = svg.append('g')
      .attr('class', 'yaxis grid')
    .selectAll('line').data(y.ticks(4)).enter()
      .append('line')
      .attr({
        'y1': function(d) {
          return y(d)
        },
        'y2': function(d) {
          return y(d)
        },
        'x2': width,
        'fill': 'none',
        'shape-rendering': 'crispEdges',
        'stroke': '#dcdcdc'
      });

    var barFull = svg.selectAll('.bars')
      .data(data)
      .enter().append('rect')
      .attr({
        'class': function(d) {
          return d.posdiff === 0 ? 'negative' : 'positive';
        },
        'y': function(d) {
          return y(d.posdiff);
        },
        'x': function(d) {
          return x(new Date(d.rawdate));
        },
        'width': width / data.length,
        'height': function(d) {
          return d.posdiff === 0 ? y(d.negdiff) - y(0) : Math.abs(y(d.posdiff) - y(0));
          
        },
        'fill': function(d) {
          return d.posdiff === 0 ? 'red' : 'green';
        }
      });

    svg.append('text')
      .attr({
        'x': width - 40,
        'y': (height / 2 + 80),
        'font-family': 'Helvetica, sans-serif',
        'font-size': '13px',
        'transform': 'rotate(270 ' + width + ',' + height / 2 + ')'
      })
      .text('Price spread');

    svg.append('line')
      .attr({
        'y1': y(0),
        'y2': y(0),
        'x2': width,
        'fill': 'none',
        'shape-rendering': 'crispEdges',
        'stroke': '#000',
        'stroke-width': '2'
      });

    /**
     * Append Legend
     */
    var legendBox = svg.append('g')
        .attr({
          'class': 'legendbox',
          'id': 'legendbox'
        });

    /**
     * Legend Spacing
     */
    var legendTabs = [0, 80];

    /**
     * Create Legend Items
     */
    var legend = legendBox.selectAll('.legend')
        .data(color.domain().slice())
      .enter().append('g')
        .attr({
          'class': 'legend',
          'transform': function(d, i) {
            return 'translate(' + legendTabs[i] + ',-45)'
          }
        });

    /**
     * Legend Boxes
     */
    legend.append('rect')
        .attr({
          'x': '0',
          'width': '14',
          'height': '14',
          'fill': color
          // 'opacity': '.5'
        });

    /**
     * Legend Text
     */
    legend.append('text')
        .attr({
          'x': '22',
          'y': '9',
          'dy': '.2em',
          'font-family': 'Helvetica, sans-serif',
          'font-size': '14',
          'text-anchor': 'begin'
        })
        .text(function(d) {
          return d;
        });

    var legendXPos = width / 2 - legendBox.node().getBBox().width / 2,
      legendYPos = canvasHeight + legendBox.node().getBBox().height * 3;

    d3.selectAll('.legendbox')
        .attr('transform', 'translate(' + legendXPos  + ',' + legendYPos + ')');

    d3.selectAll('.axis path')
      .attr({
        'stroke': '#dcdcdc',
        'fill': 'none',
        'shape-rendering': 'crispEdges'
      });

    d3.selectAll('.axis line')
      .attr({
        'stroke': '#000',
        'fill': 'none',
        'shape-rendering': 'crispEdges'
      });
  });
  
  /**
   * Parse Strings
   */
  function type(d) {
    d['posdiff'] = +d.posdiff;
    d['negdiff'] = +d.negdiff;
    return d;
  }
}

module.exports = DivergingBar;

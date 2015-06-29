var d3 = require('d3'),
  _ = require('lodash');

/**
 * [StackedBar description]
 * @param {[type]} data [description]
 */

function StackedBar(data) {
  var defaults = {
    bindTo: '#chart'
  }, settings;

  settings = _.merge(defaults, data);

  var margin, width, height, canvasHeight,
    y, x, xA, yA, color, svg;

  margin = {
    top: 50,
    right: 20,
    bottom: 20,
    left: 150
  };

  width = 1100 - margin.left - margin.right;
  height = 700 - margin.top - margin.bottom;
  canvasHeight = height + margin.top + margin.bottom;

  y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .3);

  x = d3.scale.linear()
    .rangeRound([0, width]);

  xA = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  yA = d3.svg.axis()
    .scale(y)
    .tickSize(0)
    .orient('left');

  color = d3.scale.ordinal()
    .domain([
      'Sell',
      'Hold',
      'Buy'
    ])
    .range([
      'red',
      '#bbb',
      'green'
    ]);

  svg = d3.select(settings.bindTo).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.left)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

  d3.csv('../ana-rec-comp.csv', function (error, data) {
    data.forEach(function(d) {
      d['Sell'] = +d[1];
      d['Hold'] = +d[2];
      d['Buy'] = +d[3];

      var x0 = 0,
        idx = 0;

      d.boxes = color.domain().map(function(name) {
        return {
          name: name,
          x0: x0,
          x1: x0 += +d[name],
          Total: +d.total,
          n: +d[idx += 1]
        };
      });
    });


    // Min Val [ domain ]
    // var min_val = d3.min(data, function(d) {
    //   return d.boxes['0'].x0;
    // });

    // Max Val [ domain ]
    var max_val = d3.max(data, function(d) {
      return d.boxes['2'].x1 + 5;
    });


    // X & Y Domains
    x.domain([0, max_val]).nice();
    y.domain(data.map(function(d) {
      return d.name;
    }));


    // X Axis
    var xAxis = svg.append('g')
        .attr({
          'class': 'x axis',
          'font-family': 'Helvetica, sans-serif',
          'font-size': '14',
          'fill': '#bbb',
          'stroke-width': '0',
          'transform': 'translate(0' + ',' + height +')'
        })
        .call(xA);


    // Label X Axis
    xAxis.append('g')
        .attr('transform', 'translate(' + width / 2.2 + ',' + 50 + ')')
        .append('text')
        .attr({
          'font-size': '14',
          'fill': '#000'
        })
        .text('Analyst Ratings');


    // Grid X Axis
    var xAxisGrid = svg.append('g')
        .attr('class', 'x axis grid')
      .selectAll('line').data(x.ticks()).enter()
        .append('line')
        .attr({
          'x1': function(d) {
            return x(d)
          },
          'x2': function(d) {
            return x(d)
          },
          'y2': height,
          'fill': 'none',
          'shape-rendering': 'crispEdges',
          'stroke': '#bbb'
        });


    // Y Axis
    svg.append('g')
        .attr({
          'class': 'y axis',
          'font-family': 'Helvetica, sans-serif',
          'font-size': '14'
        })
      .call(yA)
      .selectAll('text')
        .attr('x', '-10');


    // Full Bar
    var barFull = svg.selectAll('.items')
        .data(data)
      .enter().append('g')
        .attr({
          'class': 'bar',
          'transform': function(d) {
            return 'translate(0,' + y(d.name) + ')'
          }
        });


    // Sub Bar Container
    var bars = barFull.selectAll('rect')
        .data(function(d) {
          return d.boxes;
        })
      .enter().append('g')
        .attr({
          'class': 'subbar'
        });


    // Sub Bars
    bars.append('rect')
        .attr({
          'height': y.rangeBand(),
          'x': function(d) {
            return x(d.x0);
          },
          'width': function(d) {
            return x(d.x1) - x(d.x0);
          },
          'fill': function(d) {
            return color(d.name);
          }
        });


    // Sub Bar Label
    bars.append('text')
        .attr({
          'x': function(d) {
            var width = x(d.x1) - x(d.x0),
              xPos = x(d.x0);

            return width / 2.2 + xPos;
          },
          'y': y.rangeBand() / 2,
          'dy': '0.3em',
          // 'dx': '0.5em',
          'font-family': 'Helvetica, sans-serif',
          'font-size': '14',
          'fill': '#fff'
        })
        .text(function(d) {
          return d.n;
        });


    // Bar Label Total
    var barTotal = barFull.append('text')
        .attr({
          'x': function(d) {
            return x(d.total);
          },
          'y': y.rangeBand() / 2,
          'dy': '0.3em',
          'dx': '0.5em',
          'font-family': 'Helvetica, sans-serif',
          'font-size': '14',
          'fill': '#000',
          'text-anchor': 'begin'
        })
        .text(function(d) {
          return d.total;
        });


    // Legend

    var legendBox = svg.append('g')
        .attr({
          'class': 'legendbox',
          'id': 'legendbox'
        });

    var legendTabs = [0, 120, 240];

    var legend = legendBox.selectAll('.legend')
        .data(color.domain().slice())
      .enter().append('g')
        .attr({
          'class': 'legend',
          'transform': function(d, i) {
            return 'translate(' + legendTabs[i] + ',-45)'
          }
        });


    // Legend Boxes
    legend.append('rect')
        .attr({
          'x': '0',
          'width': '14',
          'height': '14',
          'fill': color
        });


    // Legend Text
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
          'stroke': '#000',
          'fill': 'none',
          'shape-rendering': 'crispEdges'
        });

    d3.selectAll('.axis line')
        .attr({
          'stroke': '#bbb',
          'fill': 'none',
          'shape-rendering': 'crispEdges'
        });
  });
}

module.exports = StackedBar;

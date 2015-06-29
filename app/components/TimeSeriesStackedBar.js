var d3 = require('d3'),
  _ = require('lodash');

/**
 * [TimeSeriesStackedBar description]
 * @param {[type]} data [description]
 */

function TimeSeriesStackedBar(data) {
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
  height = 500 - margin.top - margin.bottom;
  canvasHeight = height + margin.top + margin.bottom;

  /**
   * Main SVG Object
   */
  svg = d3.select(settings.bindTo).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.left)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

  /**
   * x Scale
   */
  var x = d3.time.scale()
    .rangeRound([0, width - 60]);

  /**
   * y Scale
   */
  var y = d3.scale.linear()
    .range([height, 0]);

  /**
   * x Axis (Months)
   */
  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.months, 1)
    .tickFormat(d3.time.format('%b'))
    .tickPadding(10)
    .orient('bottom');

  /**
   * x Axis (Years)
   */
  var xAxis2 = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(d3.time.years, 1)
    .tickFormat(d3.time.format('%Y'))
    .tickSize(0);

  /**
   * y Axis (Analyst Ratings)
   */
  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .tickSize(0)
    .tickPadding(18)
    .orient('left');

  /**
   * y Axis Secondary (Share Price)
   */
  var y2Axis = d3.svg.axis()
    .scale(y)
    .ticks(5)
    .orient('right');

  /**
   * Color Scale
   */
  color = d3.scale.ordinal()
    .domain([
      'Buy',
      'Hold',
      'Sell'
    ])
    .range([
      '#a5d6ae',
      '#dcdcdc',
      '#e5a2a3'
    ]);

  /**
   * Fetch Stacked Bar Data
   */
  d3.csv('../timeSeriesAnalystReco_discrete.csv', function (error, data) {

    /**
     * Create Stacked Bars
     * Map Color Scale / Legend
     */
    data.forEach(function(d) {
      d['Buy'] = +d['pctbuy'];
      d['Sell'] = +d['pctsell'];
      d['Hold'] = +d['pcthold'];

      var y0 = 0,
        idx = 0;

      d.boxes = color.domain().map(function(name) {
        return {
          name: name,
          y0: y0,
          y1: y0 += +d[name],
          n: +d[name],
          rating: d.rcount
        };
      });
    });
  
    /**
     * X Domain
     */
    x.domain([new Date(data[0].monthst), new Date(data[data.length - 1].monthst)]);

    /**
     * Y Domain
     */
    y.domain([0, 100]);

    /**
     * Append x Axis (Months)
     */
    svg.append('g')
    .attr({
        'class': 'x axis',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'transform': 'translate(0' + ',' + height +')'
      })
      .call(xAxis);

    /**
     * Append x Axis (Years)
     */
    svg.append('g')
    .attr({
        'class': 'x axis 2',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'stroke-width': '0',
        'transform': 'translate(0' + ',' + (height + 50) +')'
      })
      .call(xAxis2);

    /**
     * Append y Axis
     */
    svg.append('g')
    .attr({
        'class': 'y axis',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'stroke-width': '0'
      })
      .call(yAxis);

    /**
     * Center x Axis Label
     * Skin? Offset? How do we calculate?
     */
    svg.selectAll('.x.axis g')
      .select('text')
      .attr('x', 30);

    /**
     * y Axis Grid Lines
     * ticks() should be a constant
     * crete manipulation for steps/increments?
     */
    var yAxisGrid = svg.append('g')
      .attr('class', 'yaxis grid')
    .selectAll('line').data(y.ticks(5)).enter()
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

    /**
     * Create Stacked Bars
     */
    var barFull = svg.selectAll('.items')
        .data(data)
      .enter().append('g')
        .attr({
          'class': 'bar',
          'transform': function(d) {
            return 'translate(' + x(new Date(d.monthst)) + ',' + '0)'
          }
      });

    /**
     * Create Stacked Bar Containers
     */
    var bars = barFull.selectAll('rect')
        .data(function(d) {
          return d.boxes;
        })
      .enter().append('g')
        .attr({
          'class': 'subbar'
        });

    /**
     * Create .each() Stacked Bar per record
     */
    bars.append('rect')
      .attr({
        'y': function(d) {
          return y(d.y1);
        },
        'width': 50,
        'height': function(d) {
          return y(d.y0) - y(d.y1);
        },
        'fill': function(d) {
          return color(d.name);
        }
        // 'opacity': '.5'
    });

    /**
     * Append Bar Text Labels
     */
    bars.append('text')
      .attr({
        'y': function(d) {
          var height = y(d.y0) - y(d.y1),
              yPos = y(d.y1);

            return height / 2 + yPos;
        },
        'dy': '0.3em',
        'dx': '0.8em',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '12px',
        'fill': '#333'
      })
      .text(function(d) {
        return d.n.toFixed(1) + '%';
      });

    /**
     * Append Ratings
     */
    bars.append('text')
      .attr({
        'dy': '-1.6em',
        'dx': '1.4em',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '12px',
        'fill': '#333'
      })
      .text(function(d) {
        return d.rating;
      });

    svg.append('text')
      .attr({
        'font-family': 'Helvetica, sans-serif',
        'font-size': '12px',
        'x': -75,
        'y': -20
      })
      .text('# of ratings');

    /**
     * Append y Axis Label
     */
    svg.append('text')
      .attr({
        'x': -120,
        'y': height / 2,
        'font-family': 'Helvetica, sans-serif',
        'font-size': '13px',
        'transform': 'rotate(270 -70, 220)'
      })
      .text('Analyst Ratings')

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
    var legendTabs = [0, 120, 240];

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
   * Fetch Share Price Data Line 1
   * No Interpolation
   */
  d3.csv('../timeSeriesWithMargHist.data.tsData.csv', type, function (error, data) {

    /**
     * Abstract as Manipulation
     * Up or Down to Nearest 10 / Let's make dynamic
     */
    var min_val = d3.min(data, function (d) {
      return Math.floor((d.price - 1) / 10) * 10;
    });

    var max_val = d3.max(data, function (d) {
      return Math.ceil((d.price + 1) / 10) * 10;
    });

    y.domain([min_val, max_val]);

    /**
     * Create secondary y Axis
     */
    svg.append('g')
      .attr({
        'class': 'y2 axis',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'stroke-width': '0',
        'transform': 'translate(' + width + ', 0)'
      })
      .call(y2Axis);

    /**
     * Create Line
     */
    var line = d3.svg.line()
      .x(function(d) {
        return x(new Date(d.date));
      })
      .y(function(d) {
        return y(d.price);
      });

    /**
     * Draw Line
     * No interpolation
     */
    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'navy')
      .attr('stroke-width', 2)
      .attr('d', line);

    /**
     * Dot for last data point
     */
    svg.append('circle')
      .attr('cx', x(new Date(data[data.length - 1].date)))
      .attr('cy', y(data[data.length - 1].price))
      .attr('r', 4)
      .attr('fill', 'navy');

    /**
     * Text Label for last data point
     */
    svg.append('text')
      .attr({
        'x': x(new Date(data[data.length - 1].date)),
        'y': y(data[data.length - 1].price),
        'dx': '.4em',
        'dy': '.3em',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'font-weight': 'bold',
        'fill': 'navy'
      })
      .text('$' + data[data.length - 1].price);

    /**
     * Axis Label
     */
    svg.append('text')
      .attr({
        'x': width -40,
        'y': (height / 2 + 80),
        'font-family': 'Helvetica, sans-serif',
        'font-size': '13px',
        'transform': 'rotate(270 ' + width + ',' + height / 2 + ')'
      })
      .text('Share price');

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
   * Fetch Share Price Data 2nd Line
   * Stepped Line
   * .interpolate('step-before')
   */
  d3.csv('../timeSeriesWithMargHist.data.tsData2.csv', function (error, data) {

    /**
     * Create Line
     */
    var line = d3.svg.line()
      .x(function(d) {
        return x(new Date(d.date));
      })
      .y(function(d) {
        return y(d.price);
      })
      .interpolate('step-before');

    /**
     * Draw Line
     * Interpolation {step-before}
     */
    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'darkgreen')
      .attr('stroke-width', 2)
      .attr('d', line);

    /**
     * Dot for last data point
     */
    svg.append('circle')
      .attr('cx', x(new Date(data[data.length - 1].date)))
      .attr('cy', y(data[data.length - 1].price))
      .attr('r', 4)
      .attr('fill', 'darkgreen');

    /**
     * Text Label for last data point
     */
    svg.append('text')
      .attr({
        'x': x(new Date(data[data.length - 1].date)),
        'y': y(data[data.length - 1].price),
        'dx': '.4em',
        'dy': '.3em',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'font-weight': 'bold',
        'fill': 'darkgreen'
      })
      .text('$' + data[data.length - 1].price);

    /**
     * Axis Label
     */
    svg.append('text')
      .attr({
        'x': width -40,
        'y': (height / 2 + 80),
        'font-family': 'Helvetica, sans-serif',
        'font-size': '13px',
        'transform': 'rotate(270 ' + width + ',' + height / 2 + ')'
      })
      .text('Share price');

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
    d['price'] = +d.price;
    return d;
  }
}

module.exports = TimeSeriesStackedBar;

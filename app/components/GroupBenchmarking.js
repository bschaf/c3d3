var d3 = require('d3'),
  _ = require('lodash');

/**
 * [GroupBenchmarking description]
 * @param {[type]} data [description]
 */

function GroupBenchmarking(data) {
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

  d3.csv('../benchmarkingVsGroupedComps.csv', type, function(error, data) {
    
    var x0 = d3.scale.ordinal();
    var x1 = d3.scale.ordinal()
      .rangeBands([0, width]);
    var x2 = d3.scale.ordinal();

    var y = d3.scale.linear()
      .range([height, 0]);

    var xA = d3.svg.axis()
      .scale(x1)
      .outerTickSize(0)
      .orient('top');

    var x2A = d3.svg.axis()
      .scale(x2)
      .outerTickSize(0)
      .orient('bottom');

    var yA = d3.svg.axis()
      .scale(y)
      .ticks(6)
      .outerTickSize(0)
      .orient('left');

    // x2.domain(data.map(function(d) {
    //   return d.id;
    // })).rangeRoundBands([0, width], .1);

    var groupPad = 100; //config item?
    var barWidth = 100;
    var barPad = 5;
    var groupKeys = _.chain(data).pluck('group').unique().value(); 
    var ids = [];

    var newData = {};
    _.forEach(groupKeys, function(groupKey) {
      newData[groupKey] = _.filter(data, function(d) {
        if (!_.includes(ids, d.id)) {
          ids.push(d.id);
        }
        return d.group == groupKey;
      })
    });

    var barW = width / ids.length;

    var vals = _.chain(newData).values().flatten().pluck('val').value();
    var max_val = d3.max(vals, function(d) {
      return d;
    });

    y.domain([0, max_val]).nice();

    x1.domain(groupKeys);
    //x0.domain(ids).rangeRoundBands([0, x1.rangeBand()], .2);
    //x2.domain(groups).rangeRoundBands([0, width], .1);

    // Grid Y Axis
    var yAxisGrid = svg.append('g')
      .attr('class', 'y axis grid')
      .selectAll('line').data(y.ticks(6)).enter()
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
          'stroke': '#bbb'
        });

    // var xAxis = svg.append('g')
    //   .attr({
    //     'class': 'x axis',
    //     'font-family': 'Helvetica, sans-serif',
    //     'font-size': '14',
    //     'stroke-width': '3',
    //     'fill': '#000',
    //     'transform': 'translate(0, 0)'
    //   })
    //   .call(xA);

    // var xAxis2 = svg.append('g')
    //   .attr({
    //     'class': 'x axis',
    //     'font-family': 'Helvetica, sans-serif',
    //     'font-size': '14',
    //     'stroke-width': '3',
    //     'fill': '#000',
    //     'transform': 'translate(0,' + height + ')'
    //   })
    //   .call(x2A);

    var yAxis = svg.append('g')
      .attr({
        'class': 'x axis',
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'stroke-width': '0',
        'fill': '#bbb'
      })
      .call(yA);

    var yAxisLabel = svg.append('text')
      .attr({
        'x': 100,
        'y': height / 2.2,
        'font-family': 'Helvetica, sans-serif',
        'font-size': '14',
        'transform': 'rotate(270, 30, 270)'
      })
      .text('EBITDA margin');


    _.forEach(groupKeys, function(key, i) {
      var value = newData[key];

      //TODO: this is where we want to get rid of rangeRoundBands
      var group = svg.append('g')
        .attr({
          class: 'group',
          width: value.length * 100,
          transform: function() {
            return 'translate(' + x1(key) + ', 0)';
          }
        });

      var groupIds = value.map(function(f) {
        return f.id;
      });

      var groupScale = d3.scale.ordinal()
        .domain(groupIds)
        .range([0, x1.rangeBand()])
        //.rangeRoundBands([0, x1.rangeBand()], .2);

      _.forEach(value, function(bar,idx) {
        group.append('rect')
          .attr({
            'width': 100,//roupScale.rangeBand(),
            'height': y(0) - y(bar.val),
            'x': groupScale(bar.id),
            'y': y(bar.val),
            'fill': '#19335b'
          })
          .text(bar.id);
      })
    });

    // var group = svg.selectAll('.group')
    //   .data(data)
    //     .enter()
    //   .append('g')
    //     .attr({
    //       'class': 'group',
    //       'transform': function(d) {
    //         return 'translate(' + x1(d.key) + ', 0)';
    //       }
    //     });

    // var values = group.selectAll('g')
    //   .data(function(d) {
    //     return d.values;
    //   })
    //   .enter()
    //   .append('g');

    // var bars = values.append('rect')
    //   .attr({
    //     'width': x0.rangeBand(),
    //     'height': function(d) {
    //       return y(0) - y(d.val);
    //     },
    //     'x': function(d, i) {
    //       // console.log(i);
    //       // console.log(d.id, x0.domain());
    //       console.log(d3.select(this.parentNode).__data__);
    //       return x0(d.id);
    //     },
    //     'y': function(d) {
    //       return y(d.val);
    //     },
    //     'fill': '#19335b'
    //   })
    //   .text(function(d) {
    //     return d.id;
    //   });

    // barContainer.append('text')
    //   .attr({
    //     'font-family': 'Helvetica, sans-serif',
    //     'font-size': '13px',
    //     'x': function(d) {
    //       return x0(d.id);
    //     },
    //     'y': function(d) {
    //       return y(d.val);
    //     },
    //     'dx': '.8em',
    //     'dy': '-0.7em'
    //   })
    //   .text(function(d) {
    //     return d.val.toFixed(1) + '%';
    //   });

    d3.selectAll('.axis path')
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
    // Convert decimal to %
    d['val'] = +d.val * 100;
    return d;
  }
}

module.exports = GroupBenchmarking;

var d3 = require('d3'),
  _ = require('lodash');

/**
 * [Radial description]
 * @param {[type]} data [description]
 */

function Radial(data) {
  var defaults = {
    bindTo: '#chart1'
  }, settings;

  settings = _.merge(defaults, data);

  var width = 180,
    height = 180;

  var margin = {
    top: 0,
    right: 100,
    bottom: 0,
    left: 0
  }

  var data = [[0, 11.3], [0, 11.3]];

  var radialScale = d3.scale.linear()
    .domain([0, 100])
    .range([0, 2 * Math.PI]);

  var svg = d3.select(settings.bindTo).append('svg')
      .attr('width', width + margin.right)
      .attr('height', height)
    .append('g');

  var bgArc = d3.svg.arc()
    .innerRadius(35)
    .outerRadius(90)
    .startAngle(radialScale(0))
    .endAngle(radialScale(100));

  svg.append('path')
    .attr('d', bgArc)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .attr('fill', '#ddd');

  var arc = d3.svg.arc()
    .innerRadius(35)
    .outerRadius(90)
    .startAngle(function(d, i) {
      return radialScale(d[0]);
    })
    .endAngle(function(d, i) {
      return radialScale(d[1]);
    });

  svg.append('g').selectAll('path')
      .data(data)
    .enter()
      .append('path')
      .attr('d', arc)
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
      .attr('fill', function(d, i) {
        return d[2];
      })
      .append('text');

  svg.append('text')
    .text('Label')
    .attr('fill', '#16355d')
    .attr('font-size', '14px')
    .attr('font-family', 'Helvetica')
    .attr('x', width + 10)
    .attr('y', height / 2);
}

module.exports = Radial;

var StackedBar = require('./StackedBar'),
  TimeSeriesStackedBar = require('./TimeSeriesStackedBar'),
  Radial = require('./Radial'),
  DivergingBar = require('./DivergingBar'),
  GroupBenchmarking = require('./GroupBenchmarking'),
  Area = require('./Area');

/**
 * [dd3 description]
 * @type {Object}
 */

var dd3 = {
  /**
   * [function description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  render: function(data) {
    // var stackedBar = new StackedBar(data);
    // var radial = new Radial(data);
    // var timeSeriesStackedBar = new TimeSeriesStackedBar(data);
    // var divergingBar = new DivergingBar(data);
    // var groupBenchmarking = new GroupBenchmarking(data);
    var area = new Area(data);
  }
}

module.exports = dd3;

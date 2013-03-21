/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('../../lib/source-map/source-map-generator').SourceMapGenerator;
  var SourceMapConsumer = require('../../lib/source-map/source-map-consumer').SourceMapConsumer;
  var SourceNode = require('../../lib/source-map/source-node').SourceNode;
  var util = require('./util');

  exports['test some simple stuff'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'foo.js',
      sourceRoot: '.'
    });
    assert.ok(true);
  };

  exports['test JSON serialization'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'foo.js',
      sourceRoot: '.'
    });
    assert.equal(map.toString(), JSON.stringify(map));
  };

  exports['test adding mappings (case 1)'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'generated-foo.js',
      sourceRoot: '.'
    });

    assert.doesNotThrow(function () {
      map.addMapping({
        generated: { line: 1, column: 1 }
      });
    });
  };

  exports['test adding mappings (case 2)'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'generated-foo.js',
      sourceRoot: '.'
    });

    assert.doesNotThrow(function () {
      map.addMapping({
        generated: { line: 1, column: 1 },
        source: 'bar.js',
        original: { line: 1, column: 1 }
      });
    });
  };

  exports['test adding mappings (case 3)'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'generated-foo.js',
      sourceRoot: '.'
    });

    assert.doesNotThrow(function () {
      map.addMapping({
        generated: { line: 1, column: 1 },
        source: 'bar.js',
        original: { line: 1, column: 1 },
        name: 'someToken'
      });
    });
  };

  exports['test adding mappings (invalid)'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'generated-foo.js',
      sourceRoot: '.'
    });

    // Not enough info.
    assert.throws(function () {
      map.addMapping({});
    });

    // Original file position, but no source.
    assert.throws(function () {
      map.addMapping({
        generated: { line: 1, column: 1 },
        original: { line: 1, column: 1 }
      });
    });
  };

  exports['test that the correct mappings are being generated'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'min.js',
      sourceRoot: '/the/root'
    });

    map.addMapping({
      generated: { line: 1, column: 1 },
      original: { line: 1, column: 1 },
      source: 'one.js'
    });
    map.addMapping({
      generated: { line: 1, column: 5 },
      original: { line: 1, column: 5 },
      source: 'one.js'
    });
    map.addMapping({
      generated: { line: 1, column: 9 },
      original: { line: 1, column: 11 },
      source: 'one.js'
    });
    map.addMapping({
      generated: { line: 1, column: 18 },
      original: { line: 1, column: 21 },
      source: 'one.js',
      name: 'bar'
    });
    map.addMapping({
      generated: { line: 1, column: 21 },
      original: { line: 2, column: 3 },
      source: 'one.js'
    });
    map.addMapping({
      generated: { line: 1, column: 28 },
      original: { line: 2, column: 10 },
      source: 'one.js',
      name: 'baz'
    });
    map.addMapping({
      generated: { line: 1, column: 32 },
      original: { line: 2, column: 14 },
      source: 'one.js',
      name: 'bar'
    });

    map.addMapping({
      generated: { line: 2, column: 1 },
      original: { line: 1, column: 1 },
      source: 'two.js'
    });
    map.addMapping({
      generated: { line: 2, column: 5 },
      original: { line: 1, column: 5 },
      source: 'two.js'
    });
    map.addMapping({
      generated: { line: 2, column: 9 },
      original: { line: 1, column: 11 },
      source: 'two.js'
    });
    map.addMapping({
      generated: { line: 2, column: 18 },
      original: { line: 1, column: 21 },
      source: 'two.js',
      name: 'n'
    });
    map.addMapping({
      generated: { line: 2, column: 21 },
      original: { line: 2, column: 3 },
      source: 'two.js'
    });
    map.addMapping({
      generated: { line: 2, column: 28 },
      original: { line: 2, column: 10 },
      source: 'two.js',
      name: 'n'
    });

    map = JSON.parse(map.toString());

    util.assertEqualMaps(assert, map, util.testMap);
  };

  exports['test that source content can be set'] = function (assert, util) {
    var map = new SourceMapGenerator({
      file: 'min.js',
      sourceRoot: '/the/root'
    });
    map.addMapping({
      generated: { line: 1, column: 1 },
      original: { line: 1, column: 1 },
      source: 'one.js'
    });
    map.addMapping({
      generated: { line: 2, column: 1 },
      original: { line: 1, column: 1 },
      source: 'two.js'
    });
    map.setSourceContent('one.js', 'one file content');

    map = JSON.parse(map.toString());
    assert.equal(map.sources[0], 'one.js');
    assert.equal(map.sources[1], 'two.js');
    assert.equal(map.sourcesContent[0], 'one file content');
    assert.equal(map.sourcesContent[1], null);
  };

  exports['test .fromSourceMap'] = function (assert, util) {
    var map = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(util.testMap));
    util.assertEqualMaps(assert, map.toJSON(), util.testMap);
  };

  exports['test .fromSourceMap with sourcesContent'] = function (assert, util) {
    var map = SourceMapGenerator.fromSourceMap(
      new SourceMapConsumer(util.testMapWithSourcesContent));
    util.assertEqualMaps(assert, map.toJSON(), util.testMapWithSourcesContent);
  };

  exports['test applySourceMap'] = function (assert, util) {
    var node = new SourceNode(null, null, null, [
      new SourceNode(2, 0, 'fileX', 'lineX2\n'),
      'genA1\n',
      new SourceNode(2, 0, 'fileY', 'lineY2\n'),
      'genA2\n',
      new SourceNode(1, 0, 'fileX', 'lineX1\n'),
      'genA3\n',
      new SourceNode(1, 0, 'fileY', 'lineY1\n')
    ]);
    var mapStep1 = node.toStringWithSourceMap({
      file: 'fileA'
    }).map.toJSON();

    node = new SourceNode(null, null, null, [
      'gen1\n',
      new SourceNode(1, 0, 'fileA', 'lineA1\n'),
      new SourceNode(2, 0, 'fileA', 'lineA2\n'),
      new SourceNode(3, 0, 'fileA', 'lineA3\n'),
      new SourceNode(4, 0, 'fileA', 'lineA4\n'),
      new SourceNode(1, 0, 'fileB', 'lineB1\n'),
      new SourceNode(2, 0, 'fileB', 'lineB2\n'),
      'gen2\n'
    ]);
    var mapStep2 = node.toStringWithSourceMap({
      file: 'fileGen'
    }).map.toJSON();

    node = new SourceNode(null, null, null, [
      'gen1\n',
      new SourceNode(2, 0, 'fileX', 'lineA1\n'),
      new SourceNode(2, 0, 'fileA', 'lineA2\n'),
      new SourceNode(2, 0, 'fileY', 'lineA3\n'),
      new SourceNode(4, 0, 'fileA', 'lineA4\n'),
      new SourceNode(1, 0, 'fileB', 'lineB1\n'),
      new SourceNode(2, 0, 'fileB', 'lineB2\n'),
      'gen2\n'
    ]);
    var expectedMap = node.toStringWithSourceMap({
      file: 'fileGen'
    }).map.toJSON();

    // apply source map "mapStep1" to "mapStep2"
    var generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(mapStep2));
    generator.applySourceMap(new SourceMapConsumer(mapStep1));
    var actualMap = generator.toJSON();

    util.assertEqualMaps(assert, actualMap, expectedMap);
  };
});

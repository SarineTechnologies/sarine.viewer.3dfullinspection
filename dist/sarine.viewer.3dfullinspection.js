
/*!
sarine.viewer.3dfullinspection - v0.0.2 -  Monday, March 2nd, 2015, 1:14:39 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
 */

(function() {
  var FullInspection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FullInspection = (function(_super) {
    __extends(FullInspection, _super);

    function FullInspection(options) {
      FullInspection.__super__.constructor.call(this, options);
    }

    FullInspection.prototype.convertElement = function() {
      this.canvas = $("<canvas>");
      this.ctx = this.canvas[0].getContext('2d');
      this.element.append(this.canvas);
      return console.log("FullInspection: convertElement");
    };

    FullInspection.prototype.first_init = function() {
      var defer;
      defer = this.first_init_defer;
      console.log("FullInspection: first_init");
      return defer;
    };

    FullInspection.prototype.full_init = function() {
      var defer;
      defer = this.full_init_defer;
      console.log("FullInspection: full_init");
      return defer;
    };

    FullInspection.prototype.nextImage = function() {
      return console.log("FullInspection: nextImage");
    };

    return FullInspection;

  })(Viewer);

  this.FullInspection = FullInspection;

}).call(this);

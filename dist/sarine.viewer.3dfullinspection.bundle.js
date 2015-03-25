
/*!
sarine.viewer.3dfullinspection - v0.0.12 -  Wednesday, March 25th, 2015, 4:28:27 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
 */

(function() {
  var FullInspection, Viewer,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Viewer = (function() {
    var error, rm;

    rm = ResourceManager.getInstance();

    function Viewer(options) {
      this.first_init_defer = $.Deferred();
      this.full_init_defer = $.Deferred();
      this.src = options.src, this.element = options.element, this.autoPlay = options.autoPlay, this.callbackPic = options.callbackPic;
      this.id = this.element[0].id;
      this.element = this.convertElement();
      Object.getOwnPropertyNames(Viewer.prototype).forEach(function(k) {
        if (this[k].name === "Error") {
          return console.error(this.id, k, "Must be implement", this);
        }
      }, this);
      this.element.data("class", this);
      this.element.on("play", function(e) {
        return $(e.target).data("class").play.apply($(e.target).data("class"), [true]);
      });
      this.element.on("stop", function(e) {
        return $(e.target).data("class").stop.apply($(e.target).data("class"), [true]);
      });
      this.element.on("cancel", function(e) {
        return $(e.target).data("class").cancel().apply($(e.target).data("class"), [true]);
      });
    }

    error = function() {
      return console.error(this.id, "must be implement");
    };

    Viewer.prototype.first_init = Error;

    Viewer.prototype.full_init = Error;

    Viewer.prototype.play = Error;

    Viewer.prototype.stop = Error;

    Viewer.prototype.convertElement = Error;

    Viewer.prototype.cancel = function() {
      return rm.cancel(this);
    };

    Viewer.prototype.loadImage = function(src) {
      return rm.loadImage.apply(this, [src]);
    };

    Viewer.prototype.setTimeout = function(fun, delay) {
      return rm.setTimeout.apply(this, [this.delay]);
    };

    return Viewer;

  })();

  this.Viewer = Viewer;

  FullInspection = (function(_super) {
    var Metadata, Preloader, STRIDE_X, UI, ViewerBI, config;

    __extends(FullInspection, _super);

    function FullInspection(options) {
      this.full_init = __bind(this.full_init, this);
      this.first_init = __bind(this.first_init, this);
      this.convertElement = __bind(this.convertElement, this);
      this.preloadAssets = __bind(this.preloadAssets, this);
      this.resourcesPrefix = stones[0].viewersBaseUrl + "atomic/v1/assets/";
      this.resources = [
        {
          element: 'script',
          src: 'jquery-ui.js'
        }, {
          element: 'script',
          src: 'jquery.ui.ipad.altfix.js'
        }, {
          element: 'script',
          src: 'momentum.js'
        }, {
          element: 'script',
          src: 'mglass.js'
        }, {
          element: 'link',
          src: 'inspection.css'
        }
      ];
      FullInspection.__super__.constructor.call(this, options);
      this.jsonsrc = options.jsonsrc;
    }

    FullInspection.prototype.preloadAssets = function(callback) {
      var element, loaded, resource, totalScripts, triggerCallback, _i, _len, _ref, _results;
      loaded = 0;
      totalScripts = this.resources.map(function(elm) {
        return elm.element === 'script';
      });
      triggerCallback = function(callback) {
        loaded++;
        if (loaded === totalScripts.length - 1 && callback !== void 0) {
          return callback();
        }
      };
      element;
      _ref = this.resources;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        resource = _ref[_i];
        element = document.createElement(resource.element);
        if (resource.element === 'script') {
          $(document.body).append(element);
          element.onload = element.onreadystatechange = function() {
            return triggerCallback(callback);
          };
          element.src = this.resourcesPrefix + resource.src;
          _results.push(element.type = "text/javascript");
        } else {
          element.href = this.resourcesPrefix + resource.src;
          element.rel = "stylesheet";
          element.type = "text/css";
          _results.push($(document.head).prepend(element));
        }
      }
      return _results;
    };

    FullInspection.prototype.convertElement = function() {
      var url;
      url = this.resourcesPrefix + "3dfullinspection.html";
      $.get(url, (function(_this) {
        return function(innerHtml) {
          var compiled;
          compiled = $(innerHtml);
          if (_this.element.attr("menu") === "false") {
            $(".buttons", compiled).remove();
          }
          if (_this.element.attr("coordinates") === "false") {
            $(".stone_number", compiled).remove();
          }
          _this.conteiner = compiled;
          return _this.element.append(compiled);
        };
      })(this));
      return this.element;
    };

    FullInspection.prototype.first_init = function() {
      var descriptionPath, start, stone;
      this.first_init_defer = $.Deferred();
      this.full_init_defer = $.Deferred();
      stone = "";
      start = (function(_this) {
        return function(metadata) {
          _this.viewerBI = new ViewerBI({
            first_init: _this.first_init_defer,
            full_init: _this.full_init_defer,
            src: _this.src,
            x: 0,
            y: metadata.vertical_angles.indexOf(90),
            stone: stone,
            friendlyName: "temp",
            cdn_subdomain: false,
            metadata: metadata,
            debug: false
          });
          _this.UIlogic = new UI(_this.viewerBI, {
            auto_play: true
          });
          return _this.UIlogic.go();
        };
      })(this);
      descriptionPath = this.src + this.jsonsrc;
      $.getJSON(descriptionPath, (function(_this) {
        return function(result) {
          var metadata;
          stone = result.StoneId + "_" + result.MeasurementId;
          metadata = new Metadata({
            size_x: result.number_of_x_images,
            flip_from_y: result.number_of_y_images,
            background: result.background,
            vertical_angles: result.vertical_angles,
            num_focus_points: result.num_focus_points,
            shooting_parameters: result.shooting_parameters
          });
          return _this.preloadAssets(function() {
            return start(metadata);
          });
        };
      })(this)).fail((function(_this) {
        return function() {
          var checkNdelete;
          checkNdelete = function() {
            if (($(".inspect-stone", _this.element).length)) {
              $(".inspect-stone", _this.element).addClass("no_stone");
              $(".buttons", _this.element).remove();
              $(".stone_number", _this.element).remove();
              $(".inspect-stone", _this.element).css("background", "url('" + _this.callbackPic + "') no-repeat center center rgb(123, 123, 123)");
              $(".inspect-stone", _this.element).css("width", "480px");
              return $(".inspect-stone", _this.element).css("height", "480px");
            } else {
              return setTimeout(checkNdelete, 50);
            }
          };
          checkNdelete();
          return _this.first_init_defer.resolve(_this);
        };
      })(this));
      return this.first_init_defer;
    };

    FullInspection.prototype.full_init = function() {
      if (!this.viewerBI) {
        this.full_init_defer.resolve(this);
      }
      if (!this.viewerBI) {
        return this.full_init_defer;
      }
      if (this.element.attr("active") === "true") {
        this.viewerBI.preloader.go();
      }
      if (this.element.attr("active") !== void 0) {
        setInterval((function(_this) {
          return function() {
            if (_this.element.attr("active") === "true") {
              _this.viewerBI.preloader.go();
              return _this.viewerBI.show(true);
            } else {
              return _this.viewerBI.preloader.clear_queue();
            }
          };
        })(this), 500);
      }
      return this.full_init_defer;
    };

    FullInspection.prototype.nextImage = function() {
      return console.log("FullInspection: nextImage");
    };

    FullInspection.prototype.play = function() {};

    FullInspection.prototype.stop = function() {};

    STRIDE_X = 4;

    config = {
      sprite_factors: "2,4",
      image_quality: 70,
      sprite_quality: 30,
      image_size: 480,
      speed: 240,
      initial_focus: 0,
      initial_zoom: "large",
      background: "000000",
      machineEndPoint: "http://localhost:8735/Sarin.Agent",
      local: false
    };

    Metadata = (function() {
      function Metadata(options) {
        var angle, angle_focus_info, factor, focus, focus_point, i, index, option, supported, vert, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
        _ref = ["background", "initial_zoom", "sprite_factors", "shooting_parameters", "local"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          this[option] = options[option] || config[option];
        }
        _ref1 = ["size_x", "flip_from_y", "num_focus_points", "image_quality", "sprite_quality", "speed", "initial_focus", "speed"];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          option = _ref1[_j];
          this[option] = options[option] || config[option];
        }
        if (!options["vertical_angles"]) {
          vert = [];
          i = 0;
          while (i < this.flip_from_y) {
            vert[i] = parseInt(((i / (this.flip_from_y - 1)) * 180) - 90);
            i++;
          }
          this.vertical_angles = vert;
        } else {
          this.vertical_angles = options["vertical_angles"];
        }
        this.background = this.background.replace("#", "");
        this.sprite_factors = (function() {
          var _k, _len2, _ref2, _results;
          _ref2 = this.sprite_factors.split(",");
          _results = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            factor = _ref2[_k];
            _results.push(parseInt(factor));
          }
          return _results;
        }).call(this);
        this.sprite_factors.sort();
        this.size_y = (this.flip_from_y - 1) * 2 - 1;
        this.num_images = this.size_x * this.flip_from_y;
        this.num_sprite_images = this.num_images / STRIDE_X;
        this.sprite_num_y = Math.floor(Math.sqrt(this.num_sprite_images));
        this.sprite_num_x = Math.ceil(this.num_sprite_images / this.sprite_num_x);
        if (this.shooting_parameters != null) {
          this.focus_points = [];
          this.vertical_angles = [];
          for (angle in this.shooting_parameters) {
            this.vertical_angles.push(parseInt(angle));
            for (focus_point in this.shooting_parameters[angle].Focuses) {
              if (this.focus_points.indexOf(this.shooting_parameters[angle].Focuses[focus_point]) === -1) {
                this.focus_points.push(this.shooting_parameters[angle].Focuses[focus_point]);
              }
            }
          }
          this.focus_points.sort(function(a, b) {
            return a - b;
          });
          this.vertical_angles.sort(function(a, b) {
            return a - b;
          });
          this.focus_index = {};
          _ref2 = this.focus_points;
          for (index = _k = 0, _len2 = _ref2.length; _k < _len2; index = ++_k) {
            focus = _ref2[index];
            this.focus_index[focus] = index;
          }
          this.angle_focus_info = (function() {
            var _l, _len3, _ref3, _results;
            _ref3 = this.vertical_angles;
            _results = [];
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              angle = _ref3[_l];
              angle_focus_info = this.shooting_parameters["" + angle];
              supported = (function() {
                var _len4, _m, _ref4, _results1;
                _ref4 = angle_focus_info.Focuses;
                _results1 = [];
                for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
                  focus_point = _ref4[_m];
                  _results1.push(this.focus_index[focus_point]);
                }
                return _results1;
              }).call(this);
              _results.push({
                "default": this.focus_index[angle_focus_info.DefaultFocus],
                supported: supported
              });
            }
            return _results;
          }).call(this);
        }
      }

      Metadata.prototype.default_focus = function(x, y) {
        if (this.angle_focus_info != null) {
          return this.angle_focus_info[this.normal_y(y)]["default"];
        } else {
          return 0;
        }
      };

      Metadata.prototype.normal_y = function(y) {
        var normal_y;
        normal_y = y;
        if (y > Math.floor(this.size_y / 2 + 1)) {
          normal_y = this.size_y - y + 1;
        }
        return normal_y;
      };

      Metadata.prototype.supported_focus_indexes = function(x, y) {
        var _i, _ref, _results;
        if (this.shooting_parameters != null) {
          return this.angle_focus_info[this.normal_y(y)].supported;
        } else {
          return (function() {
            _results = [];
            for (var _i = 0, _ref = this.num_focus_points - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        }
      };

      Metadata.prototype.number_focuses = function(y) {};

      Metadata.prototype.next_focus = function(x, y, focus) {
        var focus_points, index;
        focus_points = this.supported_focus_indexes(x, y);
        index = focus_points.indexOf(focus);
        if (index === focus_points.length - 1) {
          return null;
        } else {
          return focus_points[index + 1];
        }
      };

      Metadata.prototype.prev_focus = function(x, y, focus) {
        var focus_points, index;
        focus_points = this.supported_focus_indexes(x, y);
        index = focus_points.indexOf(focus);
        if (index === 0) {
          return null;
        } else {
          return focus_points[index - 1];
        }
      };

      Metadata.prototype.image_name = function(x, y, focus) {
        if (focus == null) {
          focus = this.default_focus(x, this.normal_y(y));
        }
        if (this.shooting_parameters != null) {
          return "" + x + "_" + (this.normal_y(y)) + "_" + focus;
        } else {
          return focus * this.num_images + (this.normal_y(y) * this.size_x + x);
        }
      };

      Metadata.prototype.image_class = function(x, y, focus) {
        if (focus == null) {
          focus = this.default_focus(x, this.normal_y(y));
        }
        if (this.shooting_parameters != null) {
          return "" + x + "_" + (this.normal_y(y)) + "_" + config.sprite_quality;
        } else {
          return focus * this.num_images + (this.normal_y(y) * this.size_x + x);
        }
      };

      Metadata.prototype.focus_label = function() {
        if (this.shooting_parameters != null) {
          return "";
        } else {
          return "_0";
        }
      };

      Metadata.prototype.hq_trans = function() {
        if (this.shooting_parameters != null) {
          return "c_scale,h_480,q_" + this.image_quality + ",w_480";
        } else {
          return "q_" + this.image_quality;
        }
      };

      Metadata.prototype.inc_x = function(x, delta) {
        return (x + delta + this.size_x) % this.size_x;
      };

      Metadata.prototype.inc_y = function(y, delta) {
        return (y + delta + this.size_y) % this.size_y;
      };

      Metadata.prototype.multi_focus = function() {
        return (this.shooting_parameters != null) || this.num_focus_points > 1;
      };

      return Metadata;

    })();

    Preloader = (function() {
      function Preloader(callback, widget, metadata, options) {
        this.callback = callback;
        this.widget = widget;
        this.metadata = metadata;
        this.version = 0;
        this.dest = options.src;
        this.clear_queue();
        this.images = {};
        this.totals = {};
        this.stone = options.stone;
        this.cdn_subdomain = options.cdn_subdomain && window.location.protocol === 'http:' && !config.local;
        this.density = options.density || 1;
        this.fetchTimer;
      }

      Preloader.prototype.cache_key = function() {
        return this.trans;
      };

      Preloader.prototype.configure = function(trans, x, y) {
        var focus, total, _base, _i, _j, _k, _len, _name, _ref, _ref1, _ref2;
        this.trans = trans;
        this.x = x;
        this.y = y;
        (_base = this.images)[_name = this.cache_key()] || (_base[_name] = {});
        total = 0;
        this.clear_queue();
        for (x = _i = 0, _ref = this.metadata.size_x - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
          for (y = _j = 0, _ref1 = this.metadata.flip_from_y - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
            _ref2 = this.metadata.supported_focus_indexes(x, y);
            for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
              focus = _ref2[_k];
              if (this.has(x, y, focus)) {
                this.loaded++;
              }
              total++;
            }
          }
        }
        return this.totals[this.cache_key()] = total;
      };

      Preloader.prototype.clear_queue = function() {
        this.version++;
        this.loaded = 0;
        this.queue = {};
        return this.queue["all"] = [];
      };

      Preloader.prototype.go = function() {
        var focus, i, queue, shard, src, x, y, _i, _j, _k, _l, _len, _ref, _ref1, _ref2, _results;
        for (x = _i = 0, _ref = this.metadata.size_x - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
          for (y = _j = 0, _ref1 = this.metadata.flip_from_y - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
            _ref2 = this.metadata.supported_focus_indexes(x, y);
            for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
              focus = _ref2[_k];
              if (this.has(x, y, focus)) {
                continue;
              }
              src = this.src(x, y, focus);
              shard = "all";
              this.queue[shard].push({
                src: src,
                x: x,
                y: y,
                focus: focus,
                trans: this.trans,
                version: this.version
              });
            }
          }
        }
        this.prioritize();
        _results = [];
        for (i = _l = 0; _l <= 2; i = ++_l) {
          _results.push((function() {
            var _ref3, _results1;
            _ref3 = this.queue;
            _results1 = [];
            for (shard in _ref3) {
              queue = _ref3[shard];
              _results1.push(this.preload(queue));
            }
            return _results1;
          }).call(this));
        }
        return _results;
      };

      Preloader.prototype.circle_distance = function(x1, x2, size) {
        return Math.min((x1 - x2 + size) % size, (x2 - x1 + size) % size);
      };

      Preloader.prototype.prioritize = function() {
        var entry, priority, queue, shard, _i, _len, _ref, _results;
        _ref = this.queue;
        _results = [];
        for (shard in _ref) {
          queue = _ref[shard];
          for (_i = 0, _len = queue.length; _i < _len; _i++) {
            entry = queue[_i];
            priority = this.circle_distance(entry.x, this.x, this.metadata.size_x) + Math.pow(this.circle_distance(entry.y, this.y, this.metadata.flip_from_y), 2) * 50;
            if (entry.x % STRIDE_X !== 0) {
              priority += this.metadata.size_x / 2;
            }
            entry.priority = priority;
          }
          _results.push(queue.sort(function(a, b) {
            return b.priority - a.priority;
          }));
        }
        return _results;
      };

      Preloader.prototype.load_image = function(x, y, focus, src, queue) {
        var cache_key, img, trans, version;
        cache_key = this.cache_key();
        trans = this.trans;
        version = this.version;
        img = new Image();
        img.src = src;
        img.onload = (function(_this) {
          return function() {
            var image_name, was_new;
            image_name = _this.metadata.image_name(x, y, focus);
            was_new = !_this.images[cache_key][image_name];
            _this.images[cache_key][image_name] = true;
            if (_this.version === version) {
              if (was_new) {
                _this.loaded++;
              }
              _this.callback(trans, x, y, focus, src);
              if (queue != null) {
                return _this.preload(queue);
              }
            }
          };
        })(this);
        return img.onerror = img.onload;
      };

      Preloader.prototype.total = function() {
        return this.totals[this.cache_key()];
      };

      Preloader.prototype.preload = function(queue) {
        var entry;
        if (queue.length === 0) {
          return;
        }
        entry = queue.pop();
        return this.load_image(entry.x, entry.y, entry.focus, entry.src, queue);
      };

      Preloader.prototype.has = function(x, y, focus) {
        if (focus == null) {
          focus = this.metadata.default_focus(x, y);
        }
        return this.images[this.cache_key()][this.metadata.image_name(x, y, focus)] === true;
      };

      Preloader.prototype.src = function(x, y, focus, trans) {
        var attrs, _ref, _ref1;
        if (trans == null) {
          trans = "";
        }
        x = Math.floor(x / this.density) * this.density;
        attrs = {
          format: "jpg",
          quality: (_ref = trans.quality) != null ? _ref : config.image_quality,
          height: (_ref1 = trans.height) != null ? _ref1 : config.image_size
        };
        return this.dest + "/" + attrs.height + "_" + attrs.quality + "/img_" + this.metadata.image_name(x, y, focus) + ".jpg";
      };

      Preloader.prototype.fetch = function(x, y, focus) {
        var timeoutMl;
        if (focus == null) {
          focus = null;
        }
        timeoutMl = 300;
        if (this.has(x, y, focus)) {
          timeoutMl = 0;
        }
        clearTimeout(this.fetchTimer);
        return this.fetchTimer = setTimeout((function(_this) {
          return function() {
            var old_x, old_y, src, _ref, _ref1;
            if (x !== _this.x && y !== _this.y) {
              _this.x = x;
              _this.y = y;
              _this.fetch(x, y, focus);
              return;
            }
            _ref = [_this.x, x], old_x = _ref[0], _this.x = _ref[1];
            _ref1 = [_this.y, y], old_y = _ref1[0], _this.y = _ref1[1];
            if (_this.circle_distance(x, old_x, _this.metadata.size_x) > 20 || y !== old_y) {
              _this.widget.trigger('preload_xy', {
                x: x,
                y: y
              });
              _this.prioritize();
            }
            src = _this.src(x, y, focus);
            if (_this.has(x, y, focus)) {
              return _this.callback(_this.trans, x, y, focus, src);
            }
            return _this.load_image(x, y, focus, src);
          };
        })(this), timeoutMl);
      };

      return Preloader;

    })();

    ViewerBI = (function() {
      function ViewerBI(options) {
        this.img_ready = __bind(this.img_ready, this);
        this.widget = $(".inspect-stone");
        this.viewport = $(".inspect-stone > .viewport");
        this.inited = false;
        this.first_hit = true;
        this.debug = options.debug;
        this.metadata = options.metadata;
        this.stone = options.stone;
        this.friendlyName = options.friendlyName;
        this.density = options.density || 1;
        this.x = options.x;
        this.y = options.y;
        this.focus = this.metadata.initial_focus;
        this.preloader = new Preloader(this.img_ready, this.widget, this.metadata, options);
        this.mode = 'large';
        this.inspection = false;
        this.dest = options.src;
        this.first_init_defer = options.first_init;
        this.full_init_defer = options.full_init;
        this.reset();
      }

      ViewerBI.prototype.reset = function() {
        this.stop();
        return this.widget.trigger('reset');
      };

      ViewerBI.prototype.configure = function(trans) {
        this.trans = trans;
        this.stop();
        return this.preloader.configure(this.trans, this.x, this.y);
      };

      ViewerBI.prototype.img_ready = function(trans, x, y, focus, src) {
        if (this.preloader.total() === this.preloader.loaded) {
          this.full_init_defer.resolve(this);
        }
        if (this.first_hit) {
          this.first_hit = false;
          this.first_init_defer.resolve(this);
        }
        this.widget.trigger('high_quality', {
          loaded: Math.floor(this.preloader.loaded / this.density),
          total: Math.floor(this.preloader.total() / this.density)
        });
        if (x === this.x && y === this.y && focus === this.focus && trans === this.trans) {
          this.widget.removeClass('sprite');
          $('#main-image').attr({
            src: src
          });
          return this.viewport.attr({
            "class": this.flip_class()
          });
        }
      };

      ViewerBI.prototype.left = function(delta) {
        if (delta == null) {
          delta = 1;
        }
        this.direction = 'left';
        return this.move_horizontal(delta);
      };

      ViewerBI.prototype.right = function(delta) {
        if (delta == null) {
          delta = 1;
        }
        this.direction = 'right';
        return this.move_horizontal(delta);
      };

      ViewerBI.prototype.move_horizontal = function(delta) {
        if (!this.active) {
          return;
        }
        delta = Math.ceil(delta / this.density) * this.density;
        if (this.direction === 'right') {
          delta = -delta;
        }
        this.x = this.metadata.inc_x(this.x, delta);
        return this.show();
      };

      ViewerBI.prototype.up = function(delta) {
        var new_x, prev_flip;
        if (delta == null) {
          delta = 1;
        }
        if (!this.active) {
          return;
        }
        prev_flip = this.flip();
        this.direction = 'up';
        this.y = this.metadata.inc_y(this.y, -delta);
        if (prev_flip !== this.flip()) {
          new_x = (this.x + Math.floor(this.metadata.size_x / 2)) % this.metadata.size_x;
          this.x = this.metadata.inc_x(this.x, new_x - this.x);
        }
        this.fix_focus();
        return this.show();
      };

      ViewerBI.prototype.down = function(delta) {
        var new_x, prev_flip;
        if (delta == null) {
          delta = 1;
        }
        if (!this.active) {
          return;
        }
        prev_flip = this.flip();
        this.direction = 'down';
        this.y = this.metadata.inc_y(this.y, delta);
        if (prev_flip !== this.flip()) {
          new_x = (this.x + Math.floor(this.metadata.size_x / 2)) % this.metadata.size_x;
          this.x = this.metadata.inc_x(this.x, new_x - this.x);
        }
        this.fix_focus();
        return this.show();
      };

      ViewerBI.prototype.flip = function() {
        return this.y >= this.metadata.flip_from_y;
      };

      ViewerBI.prototype.flip_class = function() {
        if (this.flip()) {
          return "viewport flip";
        } else {
          return "viewport";
        }
      };

      ViewerBI.prototype.fix_focus = function() {
        if (this.metadata.supported_focus_indexes(this.x, this.y).indexOf(this.focus) === -1) {
          return this.focus = this.metadata.default_focus(this.x, this.y);
        }
      };

      ViewerBI.prototype.at_top = function() {
        return this.y === this.metadata.flip_from_y - 1;
      };

      ViewerBI.prototype.top_view = function() {
        var y_top;
        this.direction = 'up';
        y_top = this.metadata.vertical_angles.indexOf(90);
        if (y_top !== -1) {
          this.y = y_top;
        }
        this.fix_focus();
        if (!this.active) {
          return;
        }
        return this.show();
      };

      ViewerBI.prototype.at_bottom = function() {
        return this.y === this.metadata.vertical_angles.indexOf(-90);
      };

      ViewerBI.prototype.bottom_view = function() {
        var y_bottom;
        this.direction = 'up';
        y_bottom = this.metadata.vertical_angles.indexOf(-90);
        if (y_bottom !== -1) {
          this.y = y_bottom;
        }
        this.fix_focus();
        if (!this.active) {
          return;
        }
        return this.show();
      };

      ViewerBI.prototype.at_middle = function() {
        return this.y === this.metadata.vertical_angles.indexOf(0);
      };

      ViewerBI.prototype.magnify = function() {};

      ViewerBI.prototype.middle_view = function() {
        var y_middle;
        this.direction = 'up';
        y_middle = this.metadata.vertical_angles.indexOf(0);
        if (y_middle !== -1) {
          this.y = y_middle;
        }
        this.fix_focus();
        if (!this.active) {
          return;
        }
        return this.show();
      };

      ViewerBI.prototype.view_mode = function() {
        if (this.at_top()) {
          return 'top';
        }
        if (this.at_middle()) {
          return 'side';
        }
        if (this.at_bottom()) {
          return 'bottom';
        }
        return null;
      };

      ViewerBI.prototype.stop = function() {
        if (this.player) {
          return clearInterval(this.player);
        }
      };

      ViewerBI.prototype.play = function() {
        this.stop();
        return this.player = setInterval((function(_this) {
          return function() {
            _this.left();
            return _this.metadata.speed * _this.density;
          };
        })(this));
      };

      ViewerBI.prototype.show = function(force) {
        var approximate, left, sign, top, x, y;
        this.widget.trigger('xy', {
          x: this.x,
          y: this.y
        });
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        top = left = 0;
        x = this.x;
        y = this.flip() ? this.metadata.size_y + 1 - this.y : this.y;
        if (!force) {
          sign = this.direction === 'left' ? 1 : -1;
          approximate = !this.preloader.has(x, y);
          while (!(this.preloader.has(x, y) || x % STRIDE_X === 0)) {
            x = this.metadata.inc_x(x, sign);
          }
          if (approximate) {
            if (this.direction === 'up' || this.direction === 'down') {
              this.x = x;
            }
            this.timeout = setTimeout((function(_this) {
              return function() {
                _this.timeout = null;
                return _this.show(true);
              };
            })(this), 50);
            if (x % STRIDE_X === 0) {
              return this.load_from_sprite();
            }
          }
          this.load_from_sprite();
        }
        return this.preloader.fetch(this.x, this.y, this.focus);
      };

      ViewerBI.prototype.sprite_info = function(sprite_size, x, y) {
        var sprite_prefix;
        if (sprite_size == null) {
          sprite_size = this.sprite_size;
        }
        if (x == null) {
          x = this.x;
        }
        if (y == null) {
          y = this.y;
        }
        sprite_prefix = "zoom_" + this.size + "_" + sprite_size + "_" + config.sprite_quality + "_";
        return $("#info_inspection").removeClass().addClass("" + sprite_prefix + this.stone + "_img_" + this.metadata.image_name(x, y));
      };

      ViewerBI.prototype.load_from_sprite = function() {
        var bpx, bpy, info, left, sprite_left, sprite_top, src, top, top_i, _ref;
        info = this.sprite_info();
        bpy = info.css("background-position-y");
        bpx = info.css("background-position-x");
        _ref = info.css("background-position").split(" "), bpx = _ref[0], bpy = _ref[1];
        sprite_top = parseInt(bpy.replace(/px/, ''));
        sprite_left = parseInt(bpx.replace(/px/, ''));
        top_i = -sprite_top / this.sprite_size;
        top = -top_i * this.size * this.sprite_size / this.sprite_size;
        left = sprite_left * this.size / this.sprite_size;
        src = this.get_sprite_image(info);
        if (src) {
          this.widget.addClass('sprite');
          $('#sprite-image').attr({
            src: src
          }).css({
            top: top,
            left: left
          });
          return this.viewport.attr({
            "class": this.flip_class()
          });
        }
      };

      ViewerBI.prototype.get_sprite_image = function(info) {
        var match;
        match = info.css("background-image").match(/url\("?([^"]*)"?\)/);
        if (match) {
          return match[1];
        } else {
          return null;
        }
      };

      ViewerBI.prototype.load_stylesheet = function(href, sprite_size, callback) {
        var check, css_link, size;
        if (config.local) {
          callback();
          return;
        }
        if ($('link[href="' + href + '"]').length === 0) {
          css_link = $('<link></link>').attr({
            href: href,
            rel: "stylesheet",
            type: "text/css"
          });
          css_link.appendTo($('head'));
        }
        size = this.size;
        check = (function(_this) {
          return function() {
            var img, info, src;
            info = _this.sprite_info(sprite_size, 0, 0);
            src = _this.get_sprite_image(info);
            if (src != null) {
              img = new Image();
              img.src = src;
              img.startLoadStamp = new Date();
              if (img.complete) {
                img.cached = true;
              } else {
                img.cached = false;
              }
              return img.onload = function() {
                var totalTime;
                img.endLoadStamp = new Date();
                totalTime = img.endLoadStamp.getTime() - img.startLoadStamp.getTime();
                if (size === _this.size) {
                  _this.widget.find('#sprite-image').css({
                    width: (_this.metadata.sprite_num_x * sprite_size) * _this.size / sprite_size,
                    height: (_this.metadata.sprite_num_y * sprite_size) * _this.size / sprite_size
                  });
                }
                return callback();
              };
            } else {
              return setTimeout(check, 50);
            }
          };
        })(this);
        return check();
      };

      ViewerBI.prototype.zoom_large = function() {
        this.widget.removeClass('small').addClass('large');
        this.mode = 'large';
        return this.zoom(480, this.metadata.hq_trans(), 0);
      };

      ViewerBI.prototype.zoom_small = function() {
        this.widget.removeClass('large').addClass('small');
        this.mode = 'small';
        return this.zoom(320, "c_scale,h_320,q_" + this.metadata.image_quality + ",w_320", 0);
      };

      ViewerBI.prototype.mode = function() {
        return this.mode;
      };

      ViewerBI.prototype.change_focus = function(focus) {
        this.focus = focus;
        return this.show();
      };

      ViewerBI.prototype.next_focus = function() {
        return this.metadata.next_focus(this.x, this.y, this.focus);
      };

      ViewerBI.prototype.prev_focus = function() {
        return this.metadata.prev_focus(this.x, this.y, this.focus);
      };

      ViewerBI.prototype.zoom = function(size, trans) {
        var attrs, large_sprite_factor, small_css_url, sprite_factor, _ref;
        this.currentDownloadImagesLabel = size + "_" + trans;
        this.currentDownloadImagesTimeStart = new Date();
        this.size = size;
        _ref = this.metadata.sprite_factors, large_sprite_factor = _ref[0], sprite_factor = _ref[1];
        this.sprite_size = Math.floor(this.size / sprite_factor);
        this.configure(trans);
        attrs = {
          crop: "scale",
          format: "css",
          fetch_format: "jpg",
          type: "sprite",
          viewer: 'Inspection',
          height: this.size,
          width: this.size,
          quality: this.metadata.sprite_quality,
          background: '#' + this.metadata.background
        };
        small_css_url = this.dest + ("/InspectionSprites/" + this.size + "_" + this.sprite_size + "_" + this.metadata.sprite_quality + "_sprite.css");
        this.reset();
        this.show(true);
        return this.load_stylesheet(small_css_url, this.sprite_size, (function(_this) {
          return function() {
            return _this.widget.trigger('low_quality');
          };
        })(this));
      };

      return ViewerBI;

    })();

    UI = (function() {
      function UI(viewer, options) {
        this.viewer = viewer;
        this.auto_play = options.auto_play;
      }

      UI.prototype.disable_button = function(buttons) {
        return $(buttons).each((function(_this) {
          return function(index, button) {
            $(button).data('enabled', false);
            return $(button).addClass('disabled');
          };
        })(this));
      };

      UI.prototype.enable_button = function(buttons) {
        return $(buttons).each((function(_this) {
          return function(index, button) {
            $(button).data('enabled', true);
            return $(button).removeClass('disabled');
          };
        })(this));
      };

      UI.prototype.activate_button = function(buttons) {
        return $(buttons).each((function(_this) {
          return function(index, button) {
            $(button).data('active', true);
            return $(button).addClass('selected');
          };
        })(this));
      };

      UI.prototype.inactivate_button = function(buttons) {
        return $(buttons).each((function(_this) {
          return function(index, button) {
            $(button).data('active', false);
            return $(button).removeClass('selected');
          };
        })(this));
      };

      UI.prototype.update_focus_buttons = function() {
        this.disable_button('.focus_out');
        this.disable_button('.focus_in');
        this.inactivate_button('.focus_out');
        this.inactivate_button('.focus_in');
        $("#focus_label_quantity").html(this.viewer.metadata.angle_focus_info[this.viewer.metadata.normal_y(this.viewer.y)].supported.length);
        $("#focus_label_current").html(this.viewer.focus + 1);
        if ((this.viewer.next_focus() == null) && (this.viewer.prev_focus() == null)) {
          return;
        }
        if (this.viewer.prev_focus() != null) {
          this.enable_button('.focus_out');
        } else {
          this.activate_button('.focus_out');
          this.disable_button('.focus_out');
        }
        if (this.viewer.next_focus() != null) {
          return this.enable_button('.focus_in');
        } else {
          this.activate_button('.focus_in');
          return this.disable_button('.focus_in');
        }
      };

      UI.prototype.stop = function() {
        if (!this.viewer.active) {
          return false;
        }
        if (!$('.player .pause').data('active')) {
          return false;
        }
        this.activate_button($('.player .hand_tool'));
        this.inactivate_button($('.player .pause'));
        $('.player .pause').addClass('hidden');
        $('.player .play').removeClass('hidden');
        this.viewer.stop();
        this.auto_play = false;
        return false;
      };

      UI.prototype.play = function() {
        if (!$('.player .play').data('enabled')) {
          return false;
        }
        $('.player .play').addClass('hidden');
        $('.player .pause').removeClass('hidden');
        this.activate_button($('.player .pause'));
        this.inactivate_button($('.player .hand_tool'));
        this.viewer.play();
        return false;
      };

      UI.prototype.go = function() {
        this.viewer.inited = true;
        this.update_focus_buttons();
        this.mouse_x = null;
        this.mouse_y = null;
        $(window).keydown((function(_this) {
          return function(e) {
            switch (e.keyCode) {
              case 32:
                if ($('.player .pause').data('active')) {
                  _this.stop();
                } else {
                  _this.play();
                }
                break;
              case 37:
                _this.stop();
                _this.viewer.left();
                break;
              case 38:
                _this.stop();
                _this.viewer.up();
                break;
              case 39:
                _this.stop();
                _this.viewer.right();
                break;
              case 40:
                _this.stop();
                _this.viewer.down();
                break;
              case 49:
                _this.viewer.top_view();
                break;
              case 50:
                _this.viewer.middle_view();
                break;
              case 51:
                _this.viewer.bottom_view();
                break;
              case 107:
                if (!_this.viewer.active) {
                  return false;
                }
                if (_this.viewer.next_focus() == null) {
                  return false;
                }
                _this.viewer.change_focus(_this.viewer.next_focus());
                _this.update_focus_buttons();
                break;
              case 109:
                if (!_this.viewer.active) {
                  return false;
                }
                if (_this.viewer.prev_focus() == null) {
                  return false;
                }
                _this.viewer.change_focus(_this.viewer.prev_focus());
                _this.update_focus_buttons();
                break;
              default:
                return true;
            }
            return false;
          };
        })(this));
        this.viewer.widget.focus().addTouch().mousedown((function(_this) {
          return function(e) {
            _this.mouse_x = e.clientX;
            _this.mouse_y = e.clientY;
            e.preventDefault();
            return true;
          };
        })(this)).elasticmousedrag((function(_this) {
          return function(e) {
            var delta_x, delta_y, zoom_factor;
            if (_this.mouse_x === null || _this.mouse_y === null) {
              return;
            }
            _this.stop();
            zoom_factor = 4;
            delta_x = Math.round(Math.abs(e.clientX - _this.mouse_x) * zoom_factor / 100);
            if (delta_x > 0) {
              if (e.clientX > _this.mouse_x) {
                _this.viewer.right(delta_x);
              } else {
                _this.viewer.left(delta_x);
              }
              _this.mouse_x = e.clientX;
            }
            delta_y = Math.round(Math.abs(e.clientY - _this.mouse_y) * zoom_factor / 50);
            if (delta_y > 0) {
              if (e.clientY > _this.mouse_y) {
                _this.viewer.down(delta_y);
              } else {
                _this.viewer.up(delta_y);
              }
              return _this.mouse_y = e.clientY;
            }
          };
        })(this)).click(function() {
          return this.focus();
        }).bind('reset', (function(_this) {
          return function() {
            $('.display > div').html('');
            _this.viewer.active = false;
            _this.inactivate_button($('.button'));
            _this.disable_button($('.button'));
            $('.player .pause').addClass('hidden');
            $('.player .play').removeClass('hidden');
            $('.progress').stop(true).css({
              opacity: 100
            }).show().addClass('active');
            $('.progress').find('.progress_bar').css('width', '0%');
            $('.progress').find('.progress_percent').html('0%');
            if (_this.viewer.mode === "large") {
              _this.inactivate_button($(".small_link"));
              _this.enable_button($(".small_link"));
              _this.activate_button($(".large_link"));
              _this.disable_button($(".large_link"));
            } else {
              _this.activate_button($(".small_link"));
              _this.enable_button($(".large_link"));
              _this.inactivate_button($(".large_link"));
              _this.disable_button($(".small_link"));
            }
            return _this.update_focus_buttons();
          };
        })(this)).bind('low_quality', (function(_this) {
          return function() {
            $('.low_quality').html('Low quality images loaded');
            _this.viewer.active = true;
            _this.enable_button($('.buttons li'));
            if (_this.viewer.metadata.vertical_angles.indexOf(90) === !-1) {
              _this.disable_button(".top");
            }
            if (_this.viewer.metadata.vertical_angles.indexOf(0) === !-1) {
              _this.disable_button(".middle");
            }
            if (_this.viewer.metadata.vertical_angles.indexOf(-90) === !-1) {
              _this.disable_button(".bottom");
            }
            _this.viewer.top_view();
            return _this.update_focus_buttons();
          };
        })(this)).bind('med_quality', (function(_this) {
          return function() {
            return $('.med_quality').html('Medium quality images loaded');
          };
        })(this)).bind('high_quality', (function(_this) {
          return function(e, data) {
            var overAllTime, percent, progress;
            $('.high_quality').html("" + data.loaded + " / " + data.total);
            percent = Math.round((data.loaded * 100.0) / data.total);
            progress = $('.progress');
            $(progress).find('.progress_bar').css('width', Math.min(percent, 98) + '%');
            $(progress).find('.progress_percent').html(percent + '%');
            if (percent === 100) {
              $(progress).animate({
                opacity: 0
              }, 2000);
            }
            if (data.loaded === data.total && !$('.player .play').data('enabled')) {
              overAllTime = new Date().getTime() - _this.viewer.currentDownloadImagesTimeStart.getTime();
              _this.enable_button($('.player .play, .player .pause'));
              if (_this.auto_play) {
                return _this.play();
              }
            }
          };
        })(this)).bind('xy', (function(_this) {
          return function(e, data) {
            $('.xy').html((_this.viewer.metadata.multi_focus() ? "" + _this.viewer.focus + ":" : "") + ("" + data.y + ":" + data.x));
            _this.update_focus_buttons();
            _this.inactivate_button($('.buttons li'));
            if (_this.viewer.view_mode()) {
              return _this.activate_button($(".buttons ." + (_this.viewer.view_mode())));
            }
          };
        })(this)).bind('preload_xy', (function(_this) {
          return function(e, data) {
            return $('.preload_xy').html("Preload center moved to " + data.y + ":" + data.x);
          };
        })(this));
        $('.inspect-stone').css('background-color', "#" + this.viewer.metadata.background);
        if (this.viewer.metadata.background !== '000' && this.viewer.metadata.background !== '000000' && this.viewer.metadata.background !== 'black') {
          $('.inspect-stone').addClass('dark');
        }
        if (this.viewer.debug) {
          $('.display').show();
        }
        $('.player .play').click((function(_this) {
          return function() {
            return _this.play();
          };
        })(this));
        $('.player .hand_tool, .player .pause').click((function(_this) {
          return function() {
            return _this.stop();
          };
        })(this));
        $('.buttons li:not(.magnify, .clickable, .focus_out, .focus_in)').click((function(_this) {
          return function(e) {
            if (!$(e.target).data('button')) {
              return;
            }
            if (!_this.viewer.active) {
              return false;
            }
            _this.viewer[$(e.target).data('button')]();
            return false;
          };
        })(this));
        $('.small_link').click((function(_this) {
          return function() {
            _this.viewer.zoom_small();
            return false;
          };
        })(this));
        $('.large_link').click((function(_this) {
          return function() {
            _this.enable_button('.magnify');
            _this.viewer.zoom_large();
            return false;
          };
        })(this));
        $('.focus_in').click((function(_this) {
          return function() {
            if (!_this.viewer.active) {
              return false;
            }
            if (_this.viewer.next_focus() == null) {
              return false;
            }
            _this.viewer.change_focus(_this.viewer.next_focus());
            _this.update_focus_buttons();
            return false;
          };
        })(this));
        $('.focus_out').click((function(_this) {
          return function() {
            if (!_this.viewer.active) {
              return false;
            }
            if (_this.viewer.prev_focus() == null) {
              return false;
            }
            _this.viewer.change_focus(_this.viewer.prev_focus());
            _this.update_focus_buttons();
            return false;
          };
        })(this));
        $(".magnify").click((function(_this) {
          return function() {
            var image_source;
            if (_this.viewer.inspection) {
              _this.viewer.active = true;
              $('.inspect-stone').css("overflow", "hidden");
              $(document).unbind("mouseup");
              _this.viewer.MGlass.Delete();
              _this.inactivate_button($(".magnify"));
              $(".buttons li:not(.magnify)").removeClass("disabled");
              _this.update_focus_buttons();
            } else {
              _this.viewer.active = false;
              $(document).mouseup(function(e) {
                var container;
                container = $(".mglass_viewer,.magnify");
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                  return setTimeout((function() {
                    return $(".magnify").click();
                  }), 0);
                }
              });
              $(".buttons li:not(.magnify)").addClass("disabled");
              $(".magnify").show();
              $('.inspect-stone').css("overflow", "visible");
              $('.inspect-stone').css("overflow", "visible");
              if ($('mglass_wrapper').length === 0) {
                image_source = _this.viewer.preloader.src(_this.viewer.x, _this.viewer.y, _this.viewer.focus, {
                  height: 0,
                  width: 0,
                  quality: 70
                });
                _this.viewer.MGlass = new MGlass('main-image', image_source, {
                  background: _this.viewer.metadata.background
                }, arguments.callee);
              }
              _this.inactivate_button($(".focus_out"));
              _this.inactivate_button($(".focus_in"));
              _this.disable_button(".focus_out");
              _this.disable_button(".focus_in");
              _this.activate_button($(".magnify"));
            }
            return _this.viewer.inspection = !_this.viewer.inspection;
          };
        })(this));
        if (this.viewer.metadata.initial_zoom === 'small') {
          this.viewer.zoom_small();
        } else {
          this.viewer.zoom_large();
        }
        return this.update_focus_buttons();
      };

      return UI;

    })();

    return FullInspection;

  })(Viewer);

  this.FullInspection = FullInspection;

}).call(this);

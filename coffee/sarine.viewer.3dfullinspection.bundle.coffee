###!
sarine.viewer.3dfullinspection - v0.38.0 -  Tuesday, July 26th, 2016, 2:06:11 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
###

class Viewer
  rm = ResourceManager.getInstance();
  constructor: (options) ->
    console.log("")
    @first_init_defer = $.Deferred()
    @full_init_defer = $.Deferred()
    {@src, @element,@autoPlay,@callbackPic} = options
    @id = @element[0].id;
    @element = @convertElement()
    Object.getOwnPropertyNames(Viewer.prototype).forEach((k)-> 
      if @[k].name == "Error" 
          console.error @id, k, "Must be implement" , @
    ,
      @)
    @element.data "class", @
    @element.on "play", (e)-> $(e.target).data("class").play.apply($(e.target).data("class"),[true])
    @element.on "stop", (e)-> $(e.target).data("class").stop.apply($(e.target).data("class"),[true])
    @element.on "cancel", (e)-> $(e.target).data("class").cancel().apply($(e.target).data("class"),[true])
  error = () ->
    console.error(@id,"must be implement" )
  first_init: Error
  full_init: Error
  play: Error
  stop: Error
  convertElement : Error
  cancel : ()-> rm.cancel(@)
  loadImage : (src)-> rm.loadImage.apply(@,[src])
  setTimeout : (delay,callback)-> rm.setTimeout.apply(@,[@delay,callback]) 
    
@Viewer = Viewer 

class FullInspection extends Viewer
  isLocal = false
  qs = undefined
  magnifierLibName = null

  constructor: (options) -> 
    qs = new queryString()
    isLocal = qs.getValue("isLocal") == "true" 
    @resourcesPrefix = options.baseUrl + "atomic/v1/assets/"
    @setMagnifierLibName()
    @resources = [
      {element:'script',src:'jquery-ui.js'},
      {element:'script',src:'jquery.ui.ipad.altfix.js'},
      {element:'script',src:'momentum.js'},
      {element:'link',src:'inspection.css'}
    ]

    if(magnifierLibName == 'cloudzoom')
      @resources.push {element:'script',src:'cloudzoom.js'}
    else if(magnifierLibName == 'mglass')
      {element:'script',src:'mglass.js'}
      
    super(options)
    {@jsonsrc, @src} = options

  isSupportedMagnifier: (libName) ->
    return [ 'mglass', 'cloudzoom' ].filter((libItem)->
        return libItem == libName
      ).length == 1

  setMagnifierLibName: () ->
    magnifierLibName = 'mglass'
    currentExperience = configuration.experiences.filter (exper)->
      return exper.atom == 'loupe3DFullInspection'

    if(currentExperience.length == 1 && currentExperience[0].magnifierLibName && @isSupportedMagnifier(currentExperience[0].magnifierLibName))
      magnifierLibName = currentExperience[0].magnifierLibName
      return

  preloadAssets: (callback)=>

    loaded = 0
    totalScripts = @resources.map (elm)-> elm.element =='script'
    triggerCallback = (callback) ->
      loaded++
      if(loaded == totalScripts.length-1 && callback!=undefined )
        setTimeout( ()=> 
          callback() 
        ,500) 

    element
    for resource in @resources
      element = document.createElement(resource.element)
      if(resource.element == 'script')
        $(document.body).append(element)
        element.onload = element.onreadystatechange = ()-> triggerCallback(callback)
        element.src = @resourcesPrefix + resource.src + cacheVersion
        element.type= "text/javascript"

      else
        element.href = @resourcesPrefix + resource.src + cacheVersion
        element.rel= "stylesheet"
        element.type= "text/css"
        $(document.head).prepend(element) 




  convertElement :() =>
    url = @resourcesPrefix+"3dfullinspection.html" +  cacheVersion

 
    $.get url, (innerHtml) =>
      compiled = $(innerHtml)
      $(".buttons",compiled).remove() if(@element.attr("menu")=="false")
      $(".stone_number",compiled).remove() if(@element.attr("coordinates")=="false")

      @conteiner = compiled
      @element.css {width:"100%", height:"100%"}
      # compiled.find('canvas').attr({width:@element.width(), height: @element.height()})
      @element.append(compiled)
    @element

  
  first_init : () =>
    @first_init_defer = $.Deferred()
    @full_init_defer = $.Deferred()
    stone = ""
    start = (metadata) =>
      @viewerBI =  new ViewerBI(first_init: @first_init_defer, full_init:@full_init_defer, src:@src, x: 0, y: metadata.vertical_angles.indexOf(90), stone: stone, friendlyName: "temp", cdn_subdomain: false, metadata: metadata, debug: false, resourcesPrefix : @resourcesPrefix)
      @UIlogic = new UI(@viewerBI, auto_play: true)
      @UIlogic.go()

    ##TODO -new json end-point     
    if !isLocal     
      descriptionPath = @src + @jsonsrc 
    else
      localInspectionBaseUrl = @src.substr 0, @src.indexOf('ImageRepo') 
      localStoneMeasureUrl = @src.slice @src.indexOf('ImageRepo/') + 10, @src.lastIndexOf('/')
      localStoneMeasureUrlArr = localStoneMeasureUrl.split '/'
      descriptionPath = localInspectionBaseUrl + 'GetLocalJson?stoneId=' + localStoneMeasureUrlArr[0] + "&measureId=" + localStoneMeasureUrlArr[1] + "&viewer=inspection"

    $.getJSON descriptionPath, (result) =>  
      stone = result.StoneId + "_" + result.MeasurementId
      result = if isLocal then JSON.parse(result) else result
      metadata = new Metadata(
        size_x: result.number_of_x_images
        flip_from_y: result.number_of_y_images
        background: result.background
        vertical_angles: result.vertical_angles
        num_focus_points: result.num_focus_points
        shooting_parameters: result.shooting_parameters,
        image_size : result.ImageSize || 480
        sprite_factor : result.SpriteFactor || 4
      )
      @preloadAssets ()-> start metadata



    .fail =>
      checkNdelete = () =>
        if ($(".inspect-stone",@element).length)
          $(".inspect-stone",@element).addClass("no_stone")
          $(".buttons",@element).remove()
          $(".stone_number",@element).remove()
          $(".inspect-stone",@element).css("background", "url('"+@callbackPic+"') no-repeat center center")
          $(".inspect-stone",@element).css("width", "480px") # @TODO: Change to dynamic
          $(".inspect-stone",@element).css("height", "480px")
        else
          setTimeout checkNdelete, 50
      checkNdelete()

      @first_init_defer.resolve(@)

    @first_init_defer
  full_init : () =>

    @full_init_defer.resolve(@) unless @viewerBI
    return @full_init_defer unless @viewerBI

    @viewerBI.preloader.go() if(@element.attr("active")=="true")

    setInterval(=>
      if(@element.attr("active") == "true")
        @viewerBI.preloader.go()
        @viewerBI.show(true)
      else
        @viewerBI.preloader.clear_queue()

    ,500) unless @element.attr("active")==undefined
    @full_init_defer
  nextImage : ()->
    console.log "FullInspection: nextImage"
  play: () ->
    @element.attr("active","true")
  stop: () ->
    @element.attr("active","false")

  STRIDE_X = 4
  config =
    sprite_factors: "2,4" 
    image_quality: 70
    sprite_quality: 30
    image_size: 480
    speed: 240
    initial_focus: 0
    initial_zoom: "large"
    background: "000000"
    machineEndPoint: "http://localhost:8735/Sarin.Agent"
    local: false

  class Metadata
    constructor: (options) ->
      # string options, overrideable in url
      for option in ["background", "initial_zoom", "sprite_factors", "shooting_parameters", "local"]
        this[option] = options[option] || config[option]
      # integer options, overrideable in url
      for option in ["size_x", "flip_from_y", "num_focus_points", "image_quality", "sprite_quality", "speed",
                     "initial_focus", "speed","image_size", "sprite_factor"]
        this[option] =options[option] || config[option]
      # defaults
      unless options["vertical_angles"]
        vert = []
        i = 0

        while i < @flip_from_y
          vert[i] = parseInt(((i / (@flip_from_y - 1)) * 180) - 90)
          i++
        @vertical_angles = vert
      else
        @vertical_angles = options["vertical_angles"]
      @background = @background.replace("#", "")
      @sprite_factors = for factor in @sprite_factors.split(",")
        parseInt(factor)
      @sprite_factors.sort()
      # computed
      @size_y = (@flip_from_y - 1) * 2
      @num_images = @size_x * @flip_from_y
      @num_sprite_images = @num_images / STRIDE_X
      @sprite_num_y = Math.floor(Math.sqrt(@num_sprite_images))
      @sprite_num_x = Math.ceil(@num_sprite_images / @sprite_num_x)


      if @shooting_parameters?
        @focus_points = [] # All existing focus points
        @vertical_angles = [] # All vertical angles
        for angle of @shooting_parameters
          @vertical_angles.push parseInt(angle)
          for focus_point of @shooting_parameters[angle].Focuses
            @focus_points.push @shooting_parameters[angle].Focuses[focus_point] if @focus_points.indexOf(@shooting_parameters[angle].Focuses[focus_point]) is -1
        @focus_points.sort((a, b) ->
          a - b)
        @vertical_angles.sort((a, b) ->
          a - b)
        @focus_index = {} # For each angle index, give default focus and supported focus points, both as indexes into @focus_points
        @focus_index[focus] = index for focus, index in @focus_points
        @angle_focus_info =
          for angle in @vertical_angles
            angle_focus_info = @shooting_parameters["" + angle]
            supported = (@focus_index[focus_point] for focus_point in angle_focus_info.Focuses)
            {default: @focus_index[angle_focus_info.DefaultFocus], supported: supported}

    default_focus: (x, y) ->
      if @angle_focus_info?
        return @angle_focus_info[@normal_y(y)].default
      else
        return 0

    normal_y: (y) ->
      #normalize y index
      normal_y = y
      if y > Math.floor @size_y / 2
        normal_y = (@size_y - y)
      return normal_y


    supported_focus_indexes: (x, y) ->
      if @shooting_parameters?
        return @angle_focus_info[@normal_y(y)].supported
      else
        return [0..@num_focus_points - 1]
    number_focuses: (y) ->

    next_focus: (x, y, focus) ->
      focus_points = @supported_focus_indexes(x, y)
      index = focus_points.indexOf(focus)
      if index == focus_points.length - 1
        return null
      else
        return focus_points[index + 1]

    prev_focus: (x, y, focus) ->
      focus_points = @supported_focus_indexes(x, y)
      index = focus_points.indexOf(focus)
      if index == 0
        return null
      else
        return focus_points[index - 1]

    image_name: (x, y, focus) ->
      focus ?= @default_focus(x, @normal_y(y))
      if @shooting_parameters?
        return "#{x}_#{@normal_y(y)}_#{focus}"
      else
        return focus * @num_images + (@normal_y(y) * @size_x + x)
    image_class: (x, y, focus) ->
      focus ?= @default_focus(x, @normal_y(y))
      if @shooting_parameters?
        return "#{x}_#{@normal_y(y)}_#{config.sprite_quality}"
      else
        return focus * @num_images + (@normal_y(y) * @size_x + x)
    focus_label: ->
      if @shooting_parameters?
        return ""
      else
        return "_0"

    hq_trans: ->
      if @shooting_parameters?
        return "c_scale,h_480,q_#{@image_quality},w_480"
      else
        return "q_#{@image_quality}"

    inc_x: (x, delta) ->
      (x + delta + @size_x) % @size_x
    inc_y: (y, delta) ->
      (y + delta + @size_y) % @size_y

    multi_focus: ->
      @shooting_parameters? || @num_focus_points > 1

  class Preloader
    constructor: (@callback, @widget, @metadata, options) ->
      @version = 0
      @dest = options.src
      @clear_queue()
      @images = {}
      @totals = {}
      @stone = options.stone
      @cdn_subdomain = options.cdn_subdomain && window.location.protocol == 'http:' && !config.local
      @density = options.density || 1
      @fetchTimer

    cache_key: ->
      @trans

    configure: (@trans, @x, @y) ->
      @images[@cache_key()] ||= {}
      total = 0
      @clear_queue()
      for x in [0..@metadata.size_x - 1]
        for y in [0..@metadata.flip_from_y - 1]
          for focus in @metadata.supported_focus_indexes(x, y)
            @loaded++ if @has(x, y, focus)
            total++
      @totals[@cache_key()] = total

    clear_queue: ->
      @version++
      @loaded = 0
      @queue = {}
      @queue["all"] = []


    go: ->
      # Fill queue
      for x in [0..@metadata.size_x - 1]
        for y in [0..@metadata.flip_from_y - 1]
          for focus in @metadata.supported_focus_indexes(x, y)
            continue if @has(x, y, focus)
            src = @src(x, y, focus)
            shard = "all"
            @queue[shard].push
              src: src
              x: x
              y: y
              focus: focus
              trans: @trans
              version: @version
      @prioritize()
      for i in [0..2]
        for shard, queue of @queue
          @preload(queue)
    circle_distance: (x1, x2, size) ->
      Math.min((x1 - x2 + size) % size, (x2 - x1 + size) % size)
    prioritize: ->
      # later in the array is proccessed earlier
      for shard, queue of @queue
        for entry in queue
          priority = @circle_distance(entry.x, @x, @metadata.size_x) + Math.pow(@circle_distance(entry.y, @y,
            @metadata.flip_from_y), 2) * 50
          priority += @metadata.size_x / 2 if entry.x % STRIDE_X != 0
          entry.priority = priority
        # Smaller priority is better
        queue.sort (a, b) ->
          b.priority - a.priority

    load_image: (x, y, focus, src, queue) ->
      # In case it will change by the time the image is loaded
      cache_key = @cache_key()
      trans = @trans
      version = @version
      img = new Image()
      img.src = src
      img.onload = =>
        image_name = @metadata.image_name(x, y, focus)
        was_new = not @images[cache_key][image_name]
        @images[cache_key][image_name] = true
        if @version == version
          @loaded++ if was_new
          @callback(trans, x, y, focus, src)
          @preload(queue) if queue?
      img.onerror = img.onload

    total: ->
      @totals[@cache_key()] 

    preload: (queue) ->
      return if queue.length == 0
      entry = queue.pop()
      @load_image(entry.x, entry.y, entry.focus, entry.src, queue)

    has: (x, y, focus) ->
      focus ?= @metadata.default_focus(x, y)
      @images[@cache_key()][@metadata.image_name(x, y, focus)] == true 

    src: (x, y, focus, trans = "") ->
      x = Math.floor(x / @density) * @density

      attrs =
        format: "jpg"
        quality: trans.quality ? config.image_quality,
        height:  trans.height ? config.image_size

      if !isLocal
        @dest + "/" +  attrs.height + "_" + attrs.quality + "/img_" + @metadata.image_name(x, y, focus)+ ".jpg"
      else
        @dest + "/" +  "merge" + "/img_" + @metadata.image_name(x, y, focus)+ ".jpg"

    fetch: (x, y, focus = null) ->
      # Remember current position to prioritize preload better
      timeoutMl = 300
      if @has(x, y, focus)
        timeoutMl=0
      clearTimeout @fetchTimer
      @fetchTimer = setTimeout( =>
        if(x != @x && y != @y)
          @x = x
          @y = y
          @fetch(x,y,focus)
          return

        [old_x, @x] = [@x, x]
        [old_y, @y] = [@y, y]
        if @circle_distance(x, old_x, @metadata.size_x) > 20 || y != old_y
          @widget.trigger('preload_xy', x: x, y: y)
          @prioritize()
        src = @src(x, y, focus)
        return @callback(@trans, x, y, focus, src) if @has(x, y, focus)

        @load_image(x, y, focus, src)
      ,timeoutMl)

  class ViewerBI
    constructor: (options) ->
      @widget = $(".inspect-stone")
      @viewport = $(".inspect-stone > .viewport")
      @inited = false
      @first_hit = true
      @debug = options.debug
      @metadata = options.metadata
      @stone = options.stone
      @friendlyName = options.friendlyName
      @density = options.density || 1
      @x = options.x
      @y = options.y
      @focus = @metadata.initial_focus
      @preloader = new Preloader(@img_ready, @widget, @metadata, options)
      @mode = 'large'
      @inspection = false
      @dest = options.src
      @first_init_defer = options.first_init
      @full_init_defer = options.full_init
      @resourcesPrefix = options.resourcesPrefix     
      @reset()
      @context = $('#main-canvas')[0].getContext("2d")

    reset: ->
      @stop()
      @widget.trigger('reset')

    configure: (@trans) ->
      @stop()
      @preloader.configure @trans, @x, @y

    img_ready: (trans, x, y, focus, src) =>
      if @preloader.total() == @preloader.loaded
        @full_init_defer.resolve(@)


      if(@first_hit)
        @first_hit = false
        @first_init_defer.resolve(@)
        


      @widget.trigger('high_quality',
        loaded: Math.floor(@preloader.loaded / @density), total: Math.floor(@preloader.total() / @density))
      if x == @x && y == @y && focus == @focus && trans == @trans
        className = @widget[0].className
        @widget.removeClass('sprite')
        imageChanged = ($('#main-image').attr('src') != src)
        if imageChanged || className != @widget[0].className 
          $('#main-image').attr(src: src)
          $('#main-image')[0].onload = (img)->
            $('#main-canvas')[0].getContext("2d").drawImage(img.target,0,0,480,480)
          $('#main-canvas')[0].getContext("2d").drawImage($('#main-image')[0],0,0,480,480)
        @viewport.attr(class: @flip_class())
      else
        @viewport
      @viewport

    left: (delta = 1) ->
      return if typeof @.MGlass != 'undefined' && @.MGlass.isActive
      @direction = 'left'
      @move_horizontal(delta)

    right: (delta = 1) ->
      return if typeof @.MGlass != 'undefined' && @.MGlass.isActive
      @direction = 'right'
      @move_horizontal(delta)

    move_horizontal: (delta) ->
      return if !@active
      delta = Math.ceil(delta / @density) * @density
      delta = -delta if @direction == 'right'
      @x = @metadata.inc_x(@x, delta)
      @show()

    up: (delta = 1) ->
      return if !@active
      return if typeof @.MGlass != 'undefined' && @.MGlass.isActive
      prev_flip = @flip()
      @direction = 'up'
      @y = @metadata.inc_y(@y, -delta)
      unless prev_flip is @flip()
        new_x = (@x + Math.floor(@metadata.size_x / 2)) % @metadata.size_x
        @x = @metadata.inc_x(@x, new_x - @x)
      @fix_focus()
      @show()
    down: (delta = 1) ->
      return if !@active
      return if typeof @.MGlass != 'undefined' && @.MGlass.isActive
      prev_flip = @flip()
      @direction = 'down'
      @y = @metadata.inc_y(@y, delta)
      unless prev_flip is @flip()
        new_x = (@x + Math.floor(@metadata.size_x / 2)) % @metadata.size_x
        @x = @metadata.inc_x(@x, new_x - @x)
      @fix_focus()
      @show()
    flip: ->
      @y >= @metadata.flip_from_y
    flip_class: ->
      if @flip() then "viewport flip" else "viewport"
    fix_focus: ->
      if @metadata.supported_focus_indexes(@x, @y).indexOf(@focus) is -1
        @focus = @metadata.default_focus(@x, @y)


    at_top: ->
      @y == @metadata.flip_from_y - 1
    top_view: ->
      @direction = 'up'
      y_top = @metadata.vertical_angles.indexOf(90)
      @y = y_top  unless y_top is -1
      @fix_focus()
      return if !@active
      @show()

    at_bottom: ->
      @y is @metadata.vertical_angles.indexOf(-90)
    bottom_view: ->
      @direction = 'up'
      y_bottom = @metadata.vertical_angles.indexOf(-90)
      @y = y_bottom  unless y_bottom is -1
      @fix_focus()
      return if !@active
      @show()

    at_middle: ->
      @y is @metadata.vertical_angles.indexOf(0)

    magnify: ->

    middle_view: ->
      @direction = 'up'
      y_middle = @metadata.vertical_angles.indexOf(0)
      @y = y_middle  unless y_middle is -1
      @fix_focus()
      return if !@active
      @show()

    view_mode: ->
      return 'top' if @at_top()
      return 'side' if @at_middle()
      return 'bottom' if @at_bottom()
      return null

    stop: ->
      clearInterval(@player) if @player

    play: ->
      @stop()
      @player = setInterval(=>
        @left()
        @metadata.speed * @density)
    show: (force) ->
      @widget.trigger('xy', x: @x, y: @y)
      clearTimeout(@timeout) if @timeout
      top = left = 0
      x = @x
      y = if @flip() then @metadata.size_y + 1 - @y else @y
      if !force
        # Try to find the closest image according to the direction of movement
        sign = if @direction == 'left' then 1 else -1
        approximate = !@preloader.has(x, y)
        until @preloader.has(x, y) || x % STRIDE_X == 0
          x = @metadata.inc_x(x, sign)
        if approximate
          # Actually move to this x so that moving up/down will not cause the diamond to appear spinning
          @x = x if @direction == 'up' || @direction == 'down'

          # If we stay here, force loading image
          @timeout = setTimeout(=>
            @timeout = null
            this.show(true)
          , 50)
          # If we have a sprite for this image - show itfetch
          return @load_from_sprite() if x % STRIDE_X == 0
        @load_from_sprite()
      @preloader.fetch(@x, @y, @focus)
        

    sprite_info: (sprite_size = @sprite_size, x = @x, y = @y) ->
      sprite_prefix = "zoom_#{@size}_#{sprite_size}_#{config.sprite_quality}_"
      $("#info_inspection").removeClass().addClass "" + sprite_prefix + @stone + "_img_" + @metadata.image_name(x, y)

    load_from_sprite: ->
      info = @sprite_info()
      bpy = info.css("background-position-y")
      bpx = info.css("background-position-x")
      [bpx, bpy] = info.css("background-position").split(" ")

      sprite_top = parseInt(bpy.replace(/px/, ''))
      sprite_left = parseInt(bpx.replace(/px/, ''))
      top_i = -sprite_top / @sprite_size
      #top_i = @metadata.sprite_num_y - 1  - top_i if @flip()
      top = -top_i * @size * (@sprite_size) / @sprite_size

      left = sprite_left * @size / @sprite_size

      src = @get_sprite_image(info)
      if src
        @widget.addClass('sprite')
        #viewSize = Math.floor(@size / @metadata.sprite_factors[1])
        viewSize = Math.floor(@size / @metadata.sprite_factor)
        $('#sprite-image').attr(src: src,rawdata_size : @metadata.image_size).css(top: top, left: left)[0].onload = ()-> 
          rawdata_size = parseInt($(this).attr('rawdata_size'))
          sx = parseInt($(this).css("left").match(/\d+/g)[0])*-1
          sy = parseInt($(this).css("top").match(/\d+/g)[0])*-1
          $('#main-canvas')[0].getContext("2d").drawImage(this,sx,sy,viewSize,viewSize,0,0,480,480)
        
        $('#main-canvas')[0].getContext("2d").drawImage($('#sprite-image')[0],sprite_left*-1,sprite_top*-1,viewSize,viewSize,0,0,480,480)
        @viewport.attr(class: @flip_class())

    get_sprite_image: (info) ->
      match = info.css("background-image").match(/url\("?([^"]*)"?\)/)
      if match then match[1] else null

    load_stylesheet: (href, sprite_size, callback) -> #Polling for getting actual sprite image
      if config.local
        callback()
        return
      if $('link[href="' + href + '"]').length == 0
        css_link = $('<link></link>').attr(
          href: href
          rel: "stylesheet"
          type: "text/css"
        )
        css_link.appendTo($('head'))
      size = @size
      check = => 
        info = @sprite_info(sprite_size, 0, 0)
        src = @get_sprite_image(info)
        if src?
          img = new Image()
          img.src = src
          img.startLoadStamp = new Date()
          if img.complete
            img.cached = true
          else
            img.cached = false
          img.onload = => 
            img.endLoadStamp = new Date()
            totalTime = (img.endLoadStamp.getTime() - img.startLoadStamp.getTime())
            if size == @size
              @widget.find('#sprite-image').css
                width: (@metadata.sprite_num_x * sprite_size) * @size / sprite_size
                height: (@metadata.sprite_num_y * sprite_size) * @size / sprite_size
                #$('#main-canvas')[0].getContext("2d").drawImage(@widget.find('#sprite-image')[0],0,0,480,480,parseInt($(this).css("left").match(/\d+/g)[0])*-1,parseInt($(this).css("top").match(/\d+/g)[0])*-1,480*4,480*4)
            callback()
        else
          setTimeout(check, 50)
      check()

    zoom_large: ->
      @widget.removeClass('small').addClass('large')
      @mode = 'large'
      @zoom(@metadata.image_size , @metadata.hq_trans(), 0)

    zoom_small: ->
      @widget.removeClass('large').addClass('small')
      @mode = 'small'
      @zoom(320, "c_scale,h_320,q_#{@metadata.image_quality},w_320", 0)

    mode: ->
      return @mode

    change_focus: (focus) ->
      @focus = focus
      @show()

    next_focus: ->
      @metadata.next_focus(@x, @y, @focus)

    prev_focus: ->
      @metadata.prev_focus(@x, @y, @focus)

    zoom: (size, trans) ->
      @currentDownloadImagesLabel = size + "_" + trans
      @currentDownloadImagesTimeStart = new Date()
      @size = size
      [large_sprite_factor, sprite_factor] = @metadata.sprite_factors
      #@sprite_size = Math.floor(@size / sprite_factor)
      @sprite_size = Math.floor(@size / @metadata.sprite_factor) 
      @configure trans
      attrs =
        crop: "scale"
        format: "css"
        fetch_format: "jpg"
        type: "sprite"
        viewer: 'Inspection'
        height: @size
        width: @size
        quality: @metadata.sprite_quality
        background: '#' + @metadata.background
      small_css_url = @dest + "/InspectionSprites/#{@size}_#{@sprite_size}_#{@metadata.sprite_quality}_sprite.css"

      @reset()
      @show(true)
      # TODO ?? 
      if !isLocal
        @load_stylesheet(small_css_url, @sprite_size, =>
          @widget.trigger('low_quality')
        )

  class UI
    constructor: (@viewer, options) ->
      @auto_play = options.auto_play

    disable_button: (buttons) ->
      $(buttons).each((index, button) =>
        $(button).data('enabled', false)
        $(button).addClass('disabled')
      )

    enable_button: (buttons) ->
      $(buttons).each((index, button) =>
        $(button).data('enabled', true)
        $(button).removeClass('disabled')
      )

    activate_button: (buttons) ->
      $(buttons).each((index, button) =>
        $(button).data('active', true)
        $(button).addClass('selected')
      )

    inactivate_button: (buttons) ->
      $(buttons).each((index, button) =>
        $(button).data('active', false)
        $(button).removeClass('selected')
      )
    update_focus_buttons: ->
      @disable_button('.focus_out')
      @disable_button('.focus_in')
      @inactivate_button('.focus_out')
      @inactivate_button('.focus_in')
      $("#focus_label_quantity").html(@viewer.metadata.angle_focus_info[@viewer.metadata.normal_y(@viewer.y)].supported.length)
      $("#focus_label_current").html(@viewer.focus + 1)
      return if !@viewer.next_focus()? && !@viewer.prev_focus()?

      if @viewer.prev_focus()?
        @enable_button('.focus_out')
      else
        @activate_button('.focus_out')
        @disable_button('.focus_out')

      if @viewer.next_focus()?
        @enable_button('.focus_in')
      else
        @activate_button('.focus_in')
        @disable_button('.focus_in')

    stop: ->
      return false if !@viewer.active
      return false if !$('.player .pause').data('active')
      @activate_button($('.player .hand_tool'))
      @inactivate_button($('.player .pause'))
      $('.player .pause').addClass('hidden')
      $('.player .play').removeClass('hidden')
      @viewer.stop()
      @auto_play = false
      return false


    play: ->
      return false if !$('.player .play').data('enabled')
      $('.player .play').addClass('hidden')
      $('.player .pause').removeClass('hidden')
      @activate_button($('.player .pause'))
      @inactivate_button($('.player .hand_tool'))
      @viewer.play()
      return false

    initMagnify: (image_source)->
      if(magnifierLibName == 'mglass')
        @viewer.MGlass = new MGlass 'main-canvas', image_source, {
          background: @viewer.metadata.background,innerHTML : "<div class='mglass_inner_html'><div class='dummy'></div><div class='img-container'><img src='#{@viewer.resourcesPrefix}move_cursor.png' alt='move'/></div></div>"}, arguments.callee
      else if magnifierLibName == 'cloudzoom'
        magnifyOptions = {
          zoomImage: image_source,
          zoomPosition: 'inside',
          autoInside: true,
          permaZoom: true
        }

        widgetContainer = $(".slider-wrap")
        dashboardContainer = $('.slide--loupe3d')
        magnifyImageContainer = $('#magnify-image-container')
        magnifyInstance = $('#magnify-image')
        closeButton = $('#closeMagnify')
        dashboardContent = dashboardContainer.find('.content')
        if(magnifyImageContainer.length == 0)
          sliderHeight = $('.slider-wrap').last().height()
          magnifyImageContainer = $('<div id="magnify-image-container">')
          magnifyImageContainer.height(sliderHeight)
          magnifyInstance = $('<img id="magnify-image">')
          closeButtonContainer = $('<div id="closeMagnify-container">')
          closeButton = $('<a id="closeMagnify">&times;</a>')
          closeButtonContainer.append closeButton
          magnifyImageContainer.append closeButtonContainer
          magnifyImageContainer.append magnifyInstance
          magnifyInstance.css 'width', '100%'
          if(widgetContainer.length == 1)
            magnifyImageContainer.attr('class', 'slider-wrap')
            widgetContainer.before magnifyImageContainer
          else if(dashboardContainer.length == 1)
            magnifyInstance.css('margin', '0px 0px 0px 7px')
            magnifyImageContainer.attr('class', 'content')
            magnifyImageContainer.css('padding', '0')
            dashboardContainer.append magnifyImageContainer
            magnifySize = $('#magnify-image-container').height() - 50
            if(magnifySize < 280)
              magnifySize = 280
            magnifyInstance.css 'width', magnifySize + 'px'
            magnifyInstance.css 'height', magnifySize + 'px'

        magnifyInstance.attr 'src', image_source
        @viewer.CloudZoom = new CloudZoom $('#magnify-image'), magnifyOptions
        if(widgetContainer.length > 0)
          widgetContainer.hide()
        else if(dashboardContainer.length > 0)
          dashboardContent.hide()
        magnifyImageContainer.show()


        closeButton.on 'click', (=>
          @viewer.CloudZoom.closeZoom()
          if(widgetContainer.length > 0)
            widgetContainer.show()
          else if(dashboardContainer.length > 0)
            dashboardContent.show()
          magnifyImageContainer.hide()
          return
        )
        return


    deleteMagnify: ()->
      if(@viewer.MGlass)
        @viewer.MGlass.Delete()
      if(@viewer.CloudZoom)
        @viewer.CloudZoom.destroy()

    keyDownFunc : (e)=>  

        switch e.keyCode  
          when 32
            if $('.player .pause').data('active') then @stop() else @play()

          # arrows  
          when 37 
            @stop()
            if typeof @viewer.MGlass == 'undefined' then @viewer.left()  
            else if !@viewer.MGlass.isActive then @viewer.left() 
          when 38
            @stop()
            if typeof @viewer.MGlass == 'undefined' then @viewer.up()
            else if !@viewer.MGlass.isActive then @viewer.up()
          when 39
            @stop()
            if typeof @viewer.MGlass == 'undefined' then @viewer.right()
            else if !@viewer.MGlass.isActive then @viewer.right()
          when 40 
            @stop()
            if typeof @viewer.MGlass == 'undefined' then @viewer.down()
            else if !@viewer.MGlass.isActive then @viewer.down() 
 
          when 49 
            if typeof @viewer.MGlass == 'undefined' then @viewer.top_view()
            else if !@viewer.MGlass.isActive then @viewer.top_view()
          when 50
            if typeof @viewer.MGlass == 'undefined' then @viewer.middle_view()
            else if !@viewer.MGlass.isActive then @viewer.middle_view()
          when 51
            if typeof @viewer.MGlass == 'undefined' then @viewer.bottom_view()
            else if !@viewer.MGlass.isActive then @viewer.bottom_view()
          when 107
            return false if !@viewer.active
            return false if !@viewer.next_focus()?

            @viewer.change_focus(@viewer.next_focus())
            @update_focus_buttons()
          when 109
            return false if !@viewer.active
            return false if !@viewer.prev_focus()?

            @viewer.change_focus(@viewer.prev_focus())
            @update_focus_buttons()
          else return true
        return false
  
    
    go: ->

      @viewer.inited = true
      @update_focus_buttons()
      @mouse_x = null
      @mouse_y = null      
      
      $(window).keydown((e) =>        
        @keyDownFunc(e)
      )

      @viewer.widget.focus().addTouch().mousedown((e) =>
        @mouse_x = e.clientX
        @mouse_y = e.clientY
        e.preventDefault();
        return true;
      ).elasticmousedrag((e) =>
        return if @mouse_x == null || @mouse_y == null
        @stop()
        zoom_factor = 4

        delta_x = Math.round(Math.abs(e.clientX - @mouse_x) * zoom_factor / 100)

        if delta_x > 0
          if e.clientX > @mouse_x
            @viewer.right(delta_x)
          else
            @viewer.left(delta_x)
          @mouse_x = e.clientX
        delta_y = Math.round(Math.abs(e.clientY - @mouse_y) * zoom_factor / 50)
        if delta_y > 0
          if e.clientY > @mouse_y
            @viewer.down(delta_y)
          else
            @viewer.up(delta_y)
          @mouse_y = e.clientY      
      ).click(->
        this.focus()
      ).bind('reset',=>
        $('.display > div').html('')
        @viewer.active = false
        @inactivate_button($('.button'))
        @disable_button($('.button'));
        $('.player .pause').addClass('hidden') #Legacy
        $('.player .play').removeClass('hidden') #Legacy
        $('.progress').stop(true).css(opacity: 100).show().addClass('active')
        $('.progress').find('.progress_bar').css('width', '0%')
        $('.progress').find('.progress_percent').html('0%')

        if @viewer.mode is "large"
          @inactivate_button $(".small_link")
          @enable_button $(".small_link")
          @activate_button $(".large_link")
          @disable_button $(".large_link")
        else
          @activate_button $(".small_link")
          @enable_button $(".large_link")
          @inactivate_button $(".large_link")
          @disable_button $(".small_link")
        #$('.focus_selection').toggle(@viewer.metadata.num_focus_points() > 1)
        @update_focus_buttons()

      ).bind('low_quality',=>
        $('.low_quality').html('Low quality images loaded')
        @viewer.active = true
        @enable_button($('.buttons li'))
        @disable_button ".top"  if @viewer.metadata.vertical_angles.indexOf(90) is not -1
        @disable_button ".middle"  if @viewer.metadata.vertical_angles.indexOf(0) is not -1
        @disable_button ".bottom"  if @viewer.metadata.vertical_angles.indexOf(-90) is not -1
        #@activate_button($(".diamond_view.#{@viewer.view_mode()}")) if @viewer.view_mode()
        #@enable_button($('.player .hand_tool'))
        #@activate_button($('.player .hand_tool'))
        @viewer.top_view()
        @update_focus_buttons()
      ).bind('med_quality',=> #Legacy with debug
        $('.med_quality').html('Medium quality images loaded')

      ).bind('high_quality',(e, data) =>
        $('.high_quality').html("#{data.loaded} / #{data.total}")
        @viewer.active = true
        percent = Math.round(((data.loaded * 100.0) / data.total))
        progress = $('.progress')
        $(progress).find('.progress_bar').css('width', Math.min(percent, 98) + '%')
        $(progress).find('.progress_percent').html(percent + '%')
        if percent == 100
          $(progress).animate({opacity: 0}, 2000)

        if data.loaded == data.total && !$('.player .play').data('enabled')
          overAllTime = new Date().getTime() - @viewer.currentDownloadImagesTimeStart.getTime()

          @enable_button($('.player .play, .player .pause'))
          if @auto_play
            @play()
      ).bind('xy',(e, data) =>
        $('.xy').html((if @viewer.metadata.multi_focus() then "#{@viewer.focus}:" else "") + "#{data.y}:#{data.x}")
        @update_focus_buttons()
        @inactivate_button($('.buttons li'))
        @activate_button($(".buttons .#{@viewer.view_mode()}")) if @viewer.view_mode()
      ).bind('preload_xy', (e, data) =>
        $('.preload_xy').html("Preload center moved to #{data.y}:#{data.x}")
      )

      $('.inspect-stone').css('background-color', "#" + @viewer.metadata.background)  #Legacy instead of canvas
      if @viewer.metadata.background != '000' && @viewer.metadata.background != '000000' && @viewer.metadata.background != 'black'
        $('.inspect-stone').addClass('dark')

      if @viewer.debug  #Legacy
        $('.display').show()

      $('.player .play').click =>  #Legacy


        return @play()

      $('.player .hand_tool, .player .pause').click => #Legacy


        return @stop()

      $('.buttons li:not(.magnify, .clickable, .focus_out, .focus_in)').click (e) =>

        return unless $(e.target).data('button')

        return false if !@viewer.active


        @viewer[$(e.target).data('button')]()
        return false

      $('.small_link').click => # Legacy


        @viewer.zoom_small()
        #  $('.magnify').hide()
        return false

      $('.large_link').click => # Legacy
        @enable_button('.magnify')


        @viewer.zoom_large()
        #  $('.magnify').show()
        return false

      $('.focus_in').click =>
        return false if !@viewer.active
        return false if !@viewer.next_focus()?

        @viewer.change_focus(@viewer.next_focus())
        @update_focus_buttons()
        return false

      $('.focus_out').click =>
        return false if !@viewer.active
        return false if !@viewer.prev_focus()?


        @viewer.change_focus(@viewer.prev_focus())
        @update_focus_buttons()

        return false

      $(".magnify").click =>
          
        #if @viewer.mode == "small"
        #    return 1
        if @viewer.inspection
          #bindScroll()
          @viewer.active = true
          $('.inspect-stone').css("overflow", "hidden"); #Legacy
          $(document).unbind("mouseup");

          @deleteMagnify()
          @inactivate_button $(".magnify")
          $(".buttons li:not(.magnify)").removeClass("disabled");
          @update_focus_buttons()
        else
          @viewer.active = false
          if(magnifierLibName == 'mglass')
            $(document).mouseup (e)=>
              container = $ ".mglass_viewer,.magnify"
              if !container.is(e.target) and container.has(e.target).length == 0
                setTimeout (()=> $(".magnify").click() ), 0

          $(".buttons li:not(.magnify)").addClass("disabled");
          $(".magnify").show();
          #unbindScroll()
          $('.inspect-stone').css("overflow", "visible");#Legacy

          #@viewer.reset()
          if $('mglass_wrapper').length == 0
            image_source = @viewer.preloader.src(@viewer.x, @viewer.y, @viewer.focus,
              height: 0,
              width: 0,
              quality: 70
            ) 
            #image_source = @viewer.preloader.src @viewer.x, @viewer.y, @viewer.focus
            @initMagnify image_source

          @inactivate_button $(".focus_out") 
          @inactivate_button $(".focus_in")
          @disable_button ".focus_out"
          @disable_button ".focus_in" 

          @activate_button $(".magnify")


        @viewer.inspection = !@viewer.inspection

      if @viewer.metadata.initial_zoom == 'small'
        @viewer.zoom_small()
      else
        @viewer.zoom_large()
      @update_focus_buttons()




@FullInspection = FullInspection

### Query string hepler ###
class window.queryString
  constructor: (url) ->
    __qsImpl = new queryStringImpl(url)

    @getValue = (key) ->
      result = __qsImpl.params[key]
      if not result?
        result = __qsImpl.canonicalParams[key.toLowerCase()]
      return result
  
    @count = () ->
      __qsImpl.count

    @hasKey = (key) ->
      return key of __qsImpl.params || key.toLowerCase() of __qsImpl.canonicalParams


class queryStringImpl
  constructor: (url)->
    qsPart = queryStringImpl.getQueryStringPart(url)
    [@params, @canonicalParams, @count] = queryStringImpl.initParams qsPart

  @getQueryStringPart: (url) ->
    if url?
      index = url.indexOf '?'
      return if index > 0 then url.substring index else ''
    return window.location.search

  @initParams: (qsPart) ->
    params = {}
    canonicalParams = {}
    count = 0
    a = /\+/g  #// Regex for replacing addition symbol with a space
    r = /([^&=]+)=?([^&]*)/g
    d = (s) -> 
      decodeURIComponent(s.replace(a, " "))
    q = qsPart.substring(1)

    while (e = r.exec(q))
      key = d(e[1])
      value = d(e[2])
      params[key] = value
      canonicalParams[key.toLowerCase()] = value
      count += 1
    return [params, canonicalParams, count]






class ViewerBI extends ViewerBIBase
    constructor: (options) ->      
      @widget = $(".inspect-stone")
      @viewport = $(".inspect-stone > .viewport")
      @inited = false
      # @first_hit = true
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
      @atomVersion = options.atomVersion
      @reset()
      @context = $('#main-canvas')[0].getContext("2d")


    img_ready: (trans, x, y, focus, src) =>
      if @preloader.total() == @preloader.loaded    
        @full_init_defer.resolve(@)


      # if(@first_hit)
      #   @first_hit = false
        # @first_init_defer.resolve(@)


      @widget.trigger('high_quality',
        loaded: Math.floor(@preloader.loaded / @density), 
        total: Math.floor(@preloader.total() / @density)
      )

      if x == @x && y == @y && focus == @focus && trans == @trans
        className = @widget[0].className
        @widget.removeClass('sprite')
        imageChanged = ($('#main-image').attr('src') != src)
        
        if @preloader.cdn_subdomains.length && !isBucket && !isLocal
          src = @preloader.replace_subdomain(src, @preloader.cdn_subdomains[(x + y) % @preloader.cdn_subdomains.length])
        
        if imageChanged || className != @widget[0].className 
          $('#main-image').attr(src: src)
          $('#main-image')[0].onload = (img)->
            $('#main-canvas')[0].getContext("2d").drawImage(img.target,0,0,480,480)
          $('#main-canvas')[0].getContext("2d").drawImage($('#main-image')[0],0,0,480,480)
        @viewport.attr(class: @flip_class())
      else
        @viewport
      @viewport



      
class UI extends UIBase

    mglassInnerHtml: ->
      "<div class='mglass_inner_html'><div class='dummy'></div><div class='img-container'><img src='#{@viewer.resourcesPrefix}3dfullinspection/move_cursor.png?#{@viewer.atomVersion}' alt='move'/></div></div>"
    


class FullInspection extends FullInspectionBase
  qs = undefined
  reqsPerHostAllowed = 0

  constructor: (options) -> 
    if Device.isHTTP2() && !isLocal
      ## for http/2 support disable limit number of concurrent http requests
      reqsPerHostAllowed = 1000;  
    else
      reqsPerHostAllowed = 6; # 6 Requests per Hostname for http/1.1  
        
    @first_init_defer = $.Deferred()
    @full_init_defer = $.Deferred()
    @metadata = undefined
    @jsonResult = undefined
    @stone = ""

    super(options)
    

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
        element.src = @resourcesPrefix + resource.src
        element.type= "text/javascript"

      else
        element.href = @resourcesPrefix + resource.src
        element.rel= "stylesheet"
        element.type= "text/css"
        $(document.head).prepend(element) 





  first_init : () =>
    # @first_init_defer = $.Deferred()
    # @full_init_defer = $.Deferred()
    # @metadata = undefined
    # stone = ""

    # start = (metadata) =>
    #   @viewerBI =  new ViewerBI(first_init: @first_init_defer, full_init:@full_init_defer, src:@src, x: 0, y: metadata.vertical_angles.indexOf(90), stone: stone, friendlyName: "temp", cdn_subdomains: @cdn_subdomains, metadata: metadata, debug: false, resourcesPrefix : @resourcesPrefix, atomVersion: @atomVersion)
    #   @UIlogic = new UI(@viewerBI, auto_play: true)
    #   @UIlogic.go()
    
    # ##TODO -new json end-point     
    # if !isLocal     
    #   descriptionPath = @src + @jsonsrc 
    # else
    #   localInspectionBaseUrl = @src.substr 0, @src.indexOf('ImageRepo') 
    #   localStoneMeasureUrl = @src.slice @src.indexOf('ImageRepo/') + 10, @src.lastIndexOf('/')
    #   localStoneMeasureUrlArr = localStoneMeasureUrl.split '/'
    #   descriptionPath = localInspectionBaseUrl + 'GetLocalJson?stoneId=' + localStoneMeasureUrlArr[0] + "&measureId=" + localStoneMeasureUrlArr[1] + "&viewer=inspection"

    # $.getJSON descriptionPath, (result) =>  
    #   stone = result.StoneId + "_" + result.MeasurementId
    #   result = if isLocal then JSON.parse(result) else result
    #   metadata = new Metadata(
    #     size_x: result.number_of_x_images
    #     flip_from_y: result.number_of_y_images
    #     background: result.background
    #     vertical_angles: result.vertical_angles
    #     num_focus_points: result.num_focus_points
    #     shooting_parameters: result.shooting_parameters,
    #     image_size : result.ImageSize || 480
    #     sprite_factor : result.SpriteFactor || 4
    #   )
    #   @preloadAssets ()-> start metadata
    #   @first_init_defer.resolve(@)

    # .fail =>
    #   checkNdelete = () =>
    #     if ($(".inspect-stone",@element).length)
    #       $(".inspect-stone",@element).addClass("no_stone")
    #       $(".buttons",@element).remove()
    #       $(".stone_number",@element).remove()
    #       $(".inspect-stone",@element).css("background", "url('"+@callbackPic+"') no-repeat center center")
    #       $(".inspect-stone",@element).css("width", "480px") # @TODO: Change to dynamic
    #       $(".inspect-stone",@element).css("height", "480px")
    #     else
    #       setTimeout checkNdelete, 50
    #   checkNdelete()

    #   @first_init_defer.resolve(@)
    
    ##TODO -new json end-point     
    if !isLocal     
      descriptionPath = @src + @jsonsrc 
    else
      localInspectionBaseUrl = @src.substr 0, @src.indexOf('ImageRepo') 
      localStoneMeasureUrl = @src.slice @src.indexOf('ImageRepo/') + 10, @src.lastIndexOf('/')
      localStoneMeasureUrlArr = localStoneMeasureUrl.split '/'
      descriptionPath = localInspectionBaseUrl + 'GetLocalJson?stoneId=' + localStoneMeasureUrlArr[0] + "&measureId=" + localStoneMeasureUrlArr[1] + "&viewer=inspection"

    _t = @
    $.getJSON descriptionPath, (result) =>  
      @stone = result.StoneId + "_" + result.MeasurementId
      result = if isLocal then JSON.parse(result) else result
      @jsonResult = result
      
      @preloadAssets(() ->
        # load 252_126_30_sprite
        img = new Image()
        img.onload = =>
          $('#main-canvas')[0].getContext("2d").drawImage(img, 378, 126, 126, 126, 0, 0, 480, 480)
          _t.first_init_defer.resolve(@)
        
        img.onerror = =>
          # load 480_120_30_sprite if 252_126_30_sprite not found 
          console.log "252_126_30_sprite not found"
          img2 = new Image()
          img2.onload = =>
            $('#main-canvas')[0].getContext("2d").drawImage(img2, 378, 126, 126, 126, 0, 0, 480, 480)
            _t.first_init_defer.resolve(@)
          img2.onerror = =>
            _t.first_init_defer.resolve(@)
          img2.src = stones[0].viewers.loupe3DFullInspection + "/InspectionSprites/480_120_30_sprite.jpg"

        img.src = stones[0].viewers.loupe3DFullInspection + "/InspectionSprites/252_126_30_sprite.jpg"
      )

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

    _t = @
    start = (metadata) =>
      @viewerBI =  new ViewerBI(first_init: @first_init_defer, full_init:@full_init_defer, src:@src, x: 0, y: metadata.vertical_angles.indexOf(90), stone: _t.stone, friendlyName: "temp", cdn_subdomains: @cdn_subdomains, metadata: metadata, debug: false, resourcesPrefix : @resourcesPrefix, atomVersion: @atomVersion, reqsPerHostAllowed: reqsPerHostAllowed)
      @UIlogic = new UI(@viewerBI, {auto_play: true, magnifierLibName: @magnifierLibName})
      
      if (isLocal)
        @UIlogic.go()
        if(_t.element.attr("active") isnt undefined)
          _t.viewerBI.preloader.go()
          _t.viewerBI.show(true)
      else 
        @UIlogic.go(() ->
          if(_t.element.attr("active") isnt undefined)
            _t.viewerBI.preloader.go()
            _t.viewerBI.show(true)
        )
      

    # @metadata = new Metadata(
    #   size_x: @jsonResult.number_of_x_images
    #   flip_from_y: @jsonResult.number_of_y_images
    #   background: @jsonResult.background
    #   vertical_angles: @jsonResult.vertical_angles
    #   num_focus_points: @jsonResult.num_focus_points
    #   shooting_parameters: @jsonResult.shooting_parameters,
    #   image_size : @jsonResult.ImageSize || 480
    #   sprite_factor : @jsonResult.SpriteFactor || 4
    # )
    
    start new Metadata(
      size_x: _t.jsonResult.number_of_x_images
      flip_from_y: _t.jsonResult.number_of_y_images
      background: _t.jsonResult.background
      vertical_angles: _t.jsonResult.vertical_angles
      num_focus_points: _t.jsonResult.num_focus_points
      shooting_parameters: _t.jsonResult.shooting_parameters,
      image_size : _t.jsonResult.ImageSize || 480
      sprite_factor : _t.jsonResult.SpriteFactor || 4
    )




    # @full_init_defer.resolve(@) unless @viewerBI
    # return @full_init_defer unless @viewerBI

    # if(@element.attr("active") isnt undefined)
    #   @viewerBI.preloader.go()
    #   @viewerBI.show(true)
    
    @full_init_defer

@FullInspection = FullInspection

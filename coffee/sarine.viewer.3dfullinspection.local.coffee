class FullInspection extends FullInspectionBase
  qs = undefined
  
  constructor: (options) -> 
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
        element.src = @resourcesPrefix + resource.src + cacheVersion
        element.type= "text/javascript"

      else
        element.href = @resourcesPrefix + resource.src + cacheVersion
        element.rel= "stylesheet"
        element.type= "text/css"
        $(document.head).prepend(element) 





  
  first_init : () =>
    @first_init_defer = $.Deferred()
    @full_init_defer = $.Deferred()
    stone = ""
    start = (metadata) =>
      #use 6 requests per hostname for HTTP/1.1
      @viewerBI =  new ViewerBI(first_init: @first_init_defer, full_init:@full_init_defer, src:@src, x: 0, y: metadata.vertical_angles.indexOf(90), stone: stone, friendlyName: "temp", cdn_subdomains: @cdn_subdomains, metadata: metadata, debug: false, resourcesPrefix : @resourcesPrefix, reqsPerHostAllowed: 6)
      @UIlogic = new UI(@viewerBI, {auto_play: true, magnifierLibName: @magnifierLibName})
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

    if(@element.attr("active") isnt undefined)
      @viewerBI.preloader.go()
      @viewerBI.show(true)
    
    @full_init_defer


  class ViewerBI extends ViewerBIBase
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


    img_ready: (trans, x, y, focus, src) =>
      if @preloader.total() == @preloader.loaded
        @full_init_defer.resolve(@)


      if(@first_hit)
        @first_hit = false
        @first_init_defer.resolve(@)
        


      @widget.trigger('high_quality',
        loaded: Math.floor(@preloader.loaded / @density),
        total:  Math.floor(@preloader.total() / @density))
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
      "<div class='mglass_inner_html'><div class='dummy'></div><div class='img-container'><img src='#{@viewer.resourcesPrefix}move_cursor.png' alt='move'/></div></div>"

@FullInspection = FullInspection

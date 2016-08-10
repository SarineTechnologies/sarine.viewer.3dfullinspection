
sarine.viewer.3dfullinspection - v0.43.0 -  Sunday, August 14th, 2016, 6:39:38 PM 
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
        return

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





###!
sarine.viewer.3dfullinspection - v0.0.2 -  Monday, March 2nd, 2015, 1:14:39 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
###

class Viewer
  rm = ResourceManager.getInstance();
  constructor: (options) ->
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
  setTimeout : (fun,delay)-> rm.setTimeout.apply(@,[@delay])
    
@Viewer = Viewer

class FullInspection extends Viewer
	constructor: (options) ->
    super(options)
    #{@jsonFileName,@firstImagePath,@spritesPath,@oneSprite} = options
    #Change to my needs
  
	convertElement : () ->
    @canvas = $("<canvas>")
    @ctx = @canvas[0].getContext('2d')
    @element.append(@canvas)
    console.log "FullInspection: convertElement"
	
	first_init : ()->
		defer = @first_init_defer 
		console.log "FullInspection: first_init"
		defer
	full_init : ()->
    defer = @full_init_defer
    console.log "FullInspection: full_init"
    defer
	nextImage : ()->
    console.log "FullInspection: nextImage"

@FullInspection = FullInspection


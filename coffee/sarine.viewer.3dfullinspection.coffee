###!
sarine.viewer.3dfullinspection - v0.0.2 -  Monday, March 2nd, 2015, 1:14:39 PM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
###
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
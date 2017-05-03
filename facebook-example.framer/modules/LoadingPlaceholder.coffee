# Functions
_getDepthElements = (element, depth) ->
  placeLoaders = [element]
  i = 0
  while i < depth
    whatineed = []
    for layer in placeLoaders
      if layer.children.length > 0
        placeLoaders = layer.children
    i++

  return placeLoaders

_destroyPlaceHolder = (placeholder) ->
  placeholder.destroy()

_destroyMask = (currentLayer) ->
  mask = currentLayer.parent
  currentLayer.parent = mask.parent
  currentLayer.x = mask.x
  currentLayer.y = mask.y

  delete currentLayer.states.placeholderOut
  delete currentLayer.states.placeholderIn
  delete currentLayer.placeholderParent

  mask.destroy()

_startAnimateLoaded = (layer, delay) ->
  currentLayer = layer.children[1]
  placeholder = layer.children[0]

  currentLayer.animate "placeholderOut",
    delay: delay
  placeholder.animate "placeholderOut",
    delay: delay

  currentLayer.on Events.AnimationEnd, ->
    _destroyMask(currentLayer)

  placeholder.on Events.AnimationEnd, ->
    _destroyPlaceHolder(placeholder)

# Drawing
_drawTemplateLayer = (layer) ->

  placeholder = new Layer
    width: layer.width
    height: layer.height
    borderRadius: layer.borderRadius
    backgroundColor: "#eeeeee"
    x: 0
    y: 0
    opacity: 1

  gradient = new Layer
    name: "Gradient"
    parent: placeholder
    height: placeholder.height
    width: placeholder.width *2
    x: -placeholder.width
    opacity: 0.7
    style:
      background: "linear-gradient(to right, #eeeeee 10%, #dddddd 25%, #dddddd 30%, #eeeeee 45%)"

  animationLoading = new Animation gradient,
    x: placeholder.width
    time: 0.9

  animationLoading.start()
  animationLoading.on Events.AnimationEnd, ->
    Utils.delay 0.4, -> animationLoading.restart()

  return placeholder

_showAnimation = (layer, placeholder, delay) ->
  layer.states.placeholderIn =
    y: layer.height

  layer.states.placeholderOut =
    y: 0
    options:
      time: 0.2
      curve: Bezier(0.25, 0.1, 0.25, 1)
      delay: delay

  placeholder.states.placeholderOut =
    opacity: 0
    options:
      time: 0.2

_createPlaceHolders = (placeLoaders, customElement, customAnimation) ->
  delay = 0

  for layer in placeLoaders
    layer.off(Events.AnimationEnd)

    mask = new Layer
      name: "placeholder"
      parent: layer.parent
      width: layer.width
      height: layer.height
      backgroundColor: "transparent"
      x: layer.x
      y: layer.y
      clip: true
      opacity: 1

    placeholder = customElement(layer)
    placeholder.parent = mask

    layer.x = 0
    layer.y = 0
    layer.parent = mask
    layer.placeholderParent = true

    customAnimation(layer, placeholder, delay)
    layer.stateSwitch("placeholderIn")

    delay = delay + 0.1

# Methods
Layer::placeholder = (options={}) ->
  @depth = options.depth ? 0
  placeLoaders = _getDepthElements(@, @depth)

  if options.customElement
    customElement = options.customElement
  else
    customElement = exports.defaultElement

  if options.customAnimation
    customAnimation = options.customAnimation
  else
    customAnimation = exports.defaultAnimation

  _createPlaceHolders placeLoaders, customElement, customAnimation

Layer::loaded = () ->
  if @placeholderParent
    placeLoaders = [@.parent]
  else
    layers = @descendants
    placeLoaders = _.filter layers, (layer) ->
      if layer.name is "placeholder" then true

  for layer in placeLoaders
    _startAnimateLoaded(layer)

exports.loadedAll = (options={}) ->
  delay = options.delay ? 0.5

  layers = Framer.CurrentContext._layers
  placeLoaders = _.filter layers, (layer) ->
    if layer.name is "placeholder" then true

  newDelay = delay
  for layer in placeLoaders
    _startAnimateLoaded(layer, newDelay)
    newDelay = newDelay + delay

exports.defaultElement = (layer) ->
  return _drawTemplateLayer(layer)

exports.defaultAnimation = (layer, placeholder, delay) ->
  return _showAnimation(layer, placeholder, delay)
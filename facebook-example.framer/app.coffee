Placeholder = require 'LoadingPlaceholder'

screen_width = Framer.Device.screen.width
screen_height = Framer.Device.screen.height

default_w = 750
default_h = 1334

ratio = screen_width / default_w

# Layout
Container = new Layer
  width: default_w
  height: default_h
  backgroundColor: "#d3d5da"
  originY: 0
  y:0
  originX:0
  x:0
  scale: ratio

Scroll = new ScrollComponent
  parent: Container
  width: default_w
  height: default_h
  backgroundColor: "transparent"
  y:0
  x:0
  scrollHorizontal: false

headerBar = new Layer
  name: "Header"
  parent: Container
  image: 'images/headerBar.png'
  width:  750
  height: 350
  x: 0
  y: 0

FooterBar = new Layer
  name: "Footer"
  parent: Container
  image: 'images/footerBar.png'
  width:  750
  height: 89
  x: 0
  y: Align.bottom()

# Custom Placeholder
customPlaceholder = (layer) ->
  placeholder = new Layer
    name: "Row Container"
    width: layer.width
    height: layer.height
    borderRadius: layer.borderRadius
    backgroundColor: "transparent"
    x: 0
    y: 0
    opacity: 1

  for i in [0..2]
    rows = new Layer
      parent: placeholder
      width: layer.width
      height: layer.height / 3 - 32
      borderRadius: layer.borderRadius
      backgroundColor: "#eeeeee"
      clip: true
      x: 0
      y: (layer.height / 3 - 8) * i

    gradient = new Layer
      name: "Gradient" + i
      parent: rows
      height: rows.height
      width: rows.width *2
      x: -rows.width
      opacity: 0.7
      style:
        background: "linear-gradient(to right, #eeeeee 10%, #dddddd 25%, #dddddd 30%, #eeeeee 45%)"

    animationLoading = new Animation gradient,
      x: rows.width
      time: 2

    animationLoading.start()
    animationLoading.on Events.AnimationEnd,  ->
      Utils.delay 0.4, => @restart()

  return placeholder

# Init
yCard = 368
Cards = []

delayLoader = (Card, index) ->
  Utils.delay 0.9 * (index+5), ->
    Card.loaded()
    Card.after.animate
      opacity: 1
      time: 0.1

for i in [0..2]

  Card = new Layer
    name: "Card"
    parent: Scroll.content
    width:  750
    backgroundColor: "#fff"
    y: yCard
    height: 553

  CardHeader = new Layer
    name: "Card Header"
    parent: Card
    backgroundColor: "transparent"
    width:  750
    height: 80
    y: 25
    x: 25

  avatar = new Layer
    name: "Avatar"
    parent: CardHeader
    image: 'images/avatar.png'
    width:  80
    height: 80
    y: 0
    x: 0

  name = new Layer
    name: "Name"
    parent: CardHeader
    image: 'images/name.png'
    width:  312
    height: 32
    x: 100
    y: 3

  status = new Layer
    name: "Status"
    parent: CardHeader
    image: 'images/status.png'
    width:  94
    height: 31
    x: 100
    y: 45

  text = new Layer
    name: "Text"
    parent: Card
    image: 'images/text.png'
    width:  705
    height: 153
    y: 120
    x: 25

  Card.after = new Layer
    name: "After"
    parent: Card
    image: 'images/after.png'
    width:  750
    height: 294
    y: 260
    opacity: 0

  yCard = yCard + Card.height + 20

  # Define Placeholders
  text.placeholder
    customElement: customPlaceholder

  CardHeader.placeholder
    depth: 1

  delayLoader(Card , i)
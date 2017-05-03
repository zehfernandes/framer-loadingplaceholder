require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"LoadingPlaceholder":[function(require,module,exports){
var _createPlaceHolders, _destroyMask, _destroyPlaceHolder, _drawTemplateLayer, _getDepthElements, _showAnimation, _startAnimateLoaded;

_getDepthElements = function(element, depth) {
  var i, j, layer, len, placeLoaders, whatineed;
  placeLoaders = [element];
  i = 0;
  while (i < depth) {
    whatineed = [];
    for (j = 0, len = placeLoaders.length; j < len; j++) {
      layer = placeLoaders[j];
      if (layer.children.length > 0) {
        placeLoaders = layer.children;
      }
    }
    i++;
  }
  return placeLoaders;
};

_destroyPlaceHolder = function(placeholder) {
  return placeholder.destroy();
};

_destroyMask = function(currentLayer) {
  var mask;
  mask = currentLayer.parent;
  currentLayer.parent = mask.parent;
  currentLayer.x = mask.x;
  currentLayer.y = mask.y;
  delete currentLayer.states.placeholderOut;
  delete currentLayer.states.placeholderIn;
  delete currentLayer.placeholderParent;
  return mask.destroy();
};

_startAnimateLoaded = function(layer, delay) {
  var currentLayer, placeholder;
  currentLayer = layer.children[1];
  placeholder = layer.children[0];
  currentLayer.animate("placeholderOut", {
    delay: delay
  });
  placeholder.animate("placeholderOut", {
    delay: delay
  });
  currentLayer.on(Events.AnimationEnd, function() {
    return _destroyMask(currentLayer);
  });
  return placeholder.on(Events.AnimationEnd, function() {
    return _destroyPlaceHolder(placeholder);
  });
};

_drawTemplateLayer = function(layer) {
  var animationLoading, gradient, placeholder;
  placeholder = new Layer({
    width: layer.width,
    height: layer.height,
    borderRadius: layer.borderRadius,
    backgroundColor: "#eeeeee",
    x: 0,
    y: 0,
    opacity: 1
  });
  gradient = new Layer({
    name: "Gradient",
    parent: placeholder,
    height: placeholder.height,
    width: placeholder.width * 2,
    x: -placeholder.width,
    opacity: 0.7,
    style: {
      background: "linear-gradient(to right, #eeeeee 10%, #dddddd 25%, #dddddd 30%, #eeeeee 45%)"
    }
  });
  animationLoading = new Animation(gradient, {
    x: placeholder.width,
    time: 0.9
  });
  animationLoading.start();
  animationLoading.on(Events.AnimationEnd, function() {
    return Utils.delay(0.4, function() {
      return animationLoading.restart();
    });
  });
  return placeholder;
};

_showAnimation = function(layer, placeholder, delay) {
  layer.states.placeholderIn = {
    y: layer.height
  };
  layer.states.placeholderOut = {
    y: 0,
    options: {
      time: 0.2,
      curve: Bezier(0.25, 0.1, 0.25, 1),
      delay: delay
    }
  };
  return placeholder.states.placeholderOut = {
    opacity: 0,
    options: {
      time: 0.2
    }
  };
};

_createPlaceHolders = function(placeLoaders, customElement, customAnimation) {
  var delay, j, layer, len, mask, placeholder, results;
  delay = 0;
  results = [];
  for (j = 0, len = placeLoaders.length; j < len; j++) {
    layer = placeLoaders[j];
    layer.off(Events.AnimationEnd);
    mask = new Layer({
      name: "placeholder",
      parent: layer.parent,
      width: layer.width,
      height: layer.height,
      backgroundColor: "transparent",
      x: layer.x,
      y: layer.y,
      clip: true,
      opacity: 1
    });
    placeholder = customElement(layer);
    placeholder.parent = mask;
    layer.x = 0;
    layer.y = 0;
    layer.parent = mask;
    layer.placeholderParent = true;
    customAnimation(layer, placeholder, delay);
    layer.stateSwitch("placeholderIn");
    results.push(delay = delay + 0.1);
  }
  return results;
};

Layer.prototype.placeholder = function(options) {
  var customAnimation, customElement, placeLoaders, ref;
  if (options == null) {
    options = {};
  }
  this.depth = (ref = options.depth) != null ? ref : 0;
  placeLoaders = _getDepthElements(this, this.depth);
  if (options.customElement) {
    customElement = options.customElement;
  } else {
    customElement = exports.defaultElement;
  }
  if (options.customAnimation) {
    customAnimation = options.customAnimation;
  } else {
    customAnimation = exports.defaultAnimation;
  }
  return _createPlaceHolders(placeLoaders, customElement, customAnimation);
};

Layer.prototype.loaded = function() {
  var j, layer, layers, len, placeLoaders, results;
  if (this.placeholderParent) {
    placeLoaders = [this.parent];
  } else {
    layers = this.descendants;
    placeLoaders = _.filter(layers, function(layer) {
      if (layer.name === "placeholder") {
        return true;
      }
    });
  }
  results = [];
  for (j = 0, len = placeLoaders.length; j < len; j++) {
    layer = placeLoaders[j];
    results.push(_startAnimateLoaded(layer));
  }
  return results;
};

exports.loadedAll = function(options) {
  var delay, j, layer, layers, len, newDelay, placeLoaders, ref, results;
  if (options == null) {
    options = {};
  }
  delay = (ref = options.delay) != null ? ref : 0.5;
  layers = Framer.CurrentContext._layers;
  placeLoaders = _.filter(layers, function(layer) {
    if (layer.name === "placeholder") {
      return true;
    }
  });
  newDelay = delay;
  results = [];
  for (j = 0, len = placeLoaders.length; j < len; j++) {
    layer = placeLoaders[j];
    _startAnimateLoaded(layer, newDelay);
    results.push(newDelay = newDelay + delay);
  }
  return results;
};

exports.defaultElement = function(layer) {
  return _drawTemplateLayer(layer);
};

exports.defaultAnimation = function(layer, placeholder, delay) {
  return _showAnimation(layer, placeholder, delay);
};


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3plaGZlcm5hbmRlcy9TaXRlcy9mcmFtZXItbG9hZGluZ3BsYWNlaG9sZGVyL2ZhY2Vib29rLWV4YW1wbGUuZnJhbWVyL21vZHVsZXMvTG9hZGluZ1BsYWNlaG9sZGVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyBGdW5jdGlvbnNcbl9nZXREZXB0aEVsZW1lbnRzID0gKGVsZW1lbnQsIGRlcHRoKSAtPlxuICBwbGFjZUxvYWRlcnMgPSBbZWxlbWVudF1cbiAgaSA9IDBcbiAgd2hpbGUgaSA8IGRlcHRoXG4gICAgd2hhdGluZWVkID0gW11cbiAgICBmb3IgbGF5ZXIgaW4gcGxhY2VMb2FkZXJzXG4gICAgICBpZiBsYXllci5jaGlsZHJlbi5sZW5ndGggPiAwXG4gICAgICAgIHBsYWNlTG9hZGVycyA9IGxheWVyLmNoaWxkcmVuXG4gICAgaSsrXG5cbiAgcmV0dXJuIHBsYWNlTG9hZGVyc1xuXG5fZGVzdHJveVBsYWNlSG9sZGVyID0gKHBsYWNlaG9sZGVyKSAtPlxuICBwbGFjZWhvbGRlci5kZXN0cm95KClcblxuX2Rlc3Ryb3lNYXNrID0gKGN1cnJlbnRMYXllcikgLT5cbiAgbWFzayA9IGN1cnJlbnRMYXllci5wYXJlbnRcbiAgY3VycmVudExheWVyLnBhcmVudCA9IG1hc2sucGFyZW50XG4gIGN1cnJlbnRMYXllci54ID0gbWFzay54XG4gIGN1cnJlbnRMYXllci55ID0gbWFzay55XG5cbiAgZGVsZXRlIGN1cnJlbnRMYXllci5zdGF0ZXMucGxhY2Vob2xkZXJPdXRcbiAgZGVsZXRlIGN1cnJlbnRMYXllci5zdGF0ZXMucGxhY2Vob2xkZXJJblxuICBkZWxldGUgY3VycmVudExheWVyLnBsYWNlaG9sZGVyUGFyZW50XG5cbiAgbWFzay5kZXN0cm95KClcblxuX3N0YXJ0QW5pbWF0ZUxvYWRlZCA9IChsYXllciwgZGVsYXkpIC0+XG4gIGN1cnJlbnRMYXllciA9IGxheWVyLmNoaWxkcmVuWzFdXG4gIHBsYWNlaG9sZGVyID0gbGF5ZXIuY2hpbGRyZW5bMF1cblxuICBjdXJyZW50TGF5ZXIuYW5pbWF0ZSBcInBsYWNlaG9sZGVyT3V0XCIsXG4gICAgZGVsYXk6IGRlbGF5XG4gIHBsYWNlaG9sZGVyLmFuaW1hdGUgXCJwbGFjZWhvbGRlck91dFwiLFxuICAgIGRlbGF5OiBkZWxheVxuXG4gIGN1cnJlbnRMYXllci5vbiBFdmVudHMuQW5pbWF0aW9uRW5kLCAtPlxuICAgIF9kZXN0cm95TWFzayhjdXJyZW50TGF5ZXIpXG5cbiAgcGxhY2Vob2xkZXIub24gRXZlbnRzLkFuaW1hdGlvbkVuZCwgLT5cbiAgICBfZGVzdHJveVBsYWNlSG9sZGVyKHBsYWNlaG9sZGVyKVxuXG4jIERyYXdpbmdcbl9kcmF3VGVtcGxhdGVMYXllciA9IChsYXllcikgLT5cblxuICBwbGFjZWhvbGRlciA9IG5ldyBMYXllclxuICAgIHdpZHRoOiBsYXllci53aWR0aFxuICAgIGhlaWdodDogbGF5ZXIuaGVpZ2h0XG4gICAgYm9yZGVyUmFkaXVzOiBsYXllci5ib3JkZXJSYWRpdXNcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiI2VlZWVlZVwiXG4gICAgeDogMFxuICAgIHk6IDBcbiAgICBvcGFjaXR5OiAxXG5cbiAgZ3JhZGllbnQgPSBuZXcgTGF5ZXJcbiAgICBuYW1lOiBcIkdyYWRpZW50XCJcbiAgICBwYXJlbnQ6IHBsYWNlaG9sZGVyXG4gICAgaGVpZ2h0OiBwbGFjZWhvbGRlci5oZWlnaHRcbiAgICB3aWR0aDogcGxhY2Vob2xkZXIud2lkdGggKjJcbiAgICB4OiAtcGxhY2Vob2xkZXIud2lkdGhcbiAgICBvcGFjaXR5OiAwLjdcbiAgICBzdHlsZTpcbiAgICAgIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KHRvIHJpZ2h0LCAjZWVlZWVlIDEwJSwgI2RkZGRkZCAyNSUsICNkZGRkZGQgMzAlLCAjZWVlZWVlIDQ1JSlcIlxuXG4gIGFuaW1hdGlvbkxvYWRpbmcgPSBuZXcgQW5pbWF0aW9uIGdyYWRpZW50LFxuICAgIHg6IHBsYWNlaG9sZGVyLndpZHRoXG4gICAgdGltZTogMC45XG5cbiAgYW5pbWF0aW9uTG9hZGluZy5zdGFydCgpXG4gIGFuaW1hdGlvbkxvYWRpbmcub24gRXZlbnRzLkFuaW1hdGlvbkVuZCwgLT5cbiAgICBVdGlscy5kZWxheSAwLjQsIC0+IGFuaW1hdGlvbkxvYWRpbmcucmVzdGFydCgpXG5cbiAgcmV0dXJuIHBsYWNlaG9sZGVyXG5cbl9zaG93QW5pbWF0aW9uID0gKGxheWVyLCBwbGFjZWhvbGRlciwgZGVsYXkpIC0+XG4gIGxheWVyLnN0YXRlcy5wbGFjZWhvbGRlckluID1cbiAgICB5OiBsYXllci5oZWlnaHRcblxuICBsYXllci5zdGF0ZXMucGxhY2Vob2xkZXJPdXQgPVxuICAgIHk6IDBcbiAgICBvcHRpb25zOlxuICAgICAgdGltZTogMC4yXG4gICAgICBjdXJ2ZTogQmV6aWVyKDAuMjUsIDAuMSwgMC4yNSwgMSlcbiAgICAgIGRlbGF5OiBkZWxheVxuXG4gIHBsYWNlaG9sZGVyLnN0YXRlcy5wbGFjZWhvbGRlck91dCA9XG4gICAgb3BhY2l0eTogMFxuICAgIG9wdGlvbnM6XG4gICAgICB0aW1lOiAwLjJcblxuX2NyZWF0ZVBsYWNlSG9sZGVycyA9IChwbGFjZUxvYWRlcnMsIGN1c3RvbUVsZW1lbnQsIGN1c3RvbUFuaW1hdGlvbikgLT5cbiAgZGVsYXkgPSAwXG5cbiAgZm9yIGxheWVyIGluIHBsYWNlTG9hZGVyc1xuICAgIGxheWVyLm9mZihFdmVudHMuQW5pbWF0aW9uRW5kKVxuXG4gICAgbWFzayA9IG5ldyBMYXllclxuICAgICAgbmFtZTogXCJwbGFjZWhvbGRlclwiXG4gICAgICBwYXJlbnQ6IGxheWVyLnBhcmVudFxuICAgICAgd2lkdGg6IGxheWVyLndpZHRoXG4gICAgICBoZWlnaHQ6IGxheWVyLmhlaWdodFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcbiAgICAgIHg6IGxheWVyLnhcbiAgICAgIHk6IGxheWVyLnlcbiAgICAgIGNsaXA6IHRydWVcbiAgICAgIG9wYWNpdHk6IDFcblxuICAgIHBsYWNlaG9sZGVyID0gY3VzdG9tRWxlbWVudChsYXllcilcbiAgICBwbGFjZWhvbGRlci5wYXJlbnQgPSBtYXNrXG5cbiAgICBsYXllci54ID0gMFxuICAgIGxheWVyLnkgPSAwXG4gICAgbGF5ZXIucGFyZW50ID0gbWFza1xuICAgIGxheWVyLnBsYWNlaG9sZGVyUGFyZW50ID0gdHJ1ZVxuXG4gICAgY3VzdG9tQW5pbWF0aW9uKGxheWVyLCBwbGFjZWhvbGRlciwgZGVsYXkpXG4gICAgbGF5ZXIuc3RhdGVTd2l0Y2goXCJwbGFjZWhvbGRlckluXCIpXG5cbiAgICBkZWxheSA9IGRlbGF5ICsgMC4xXG5cbiMgTWV0aG9kc1xuTGF5ZXI6OnBsYWNlaG9sZGVyID0gKG9wdGlvbnM9e30pIC0+XG4gIEBkZXB0aCA9IG9wdGlvbnMuZGVwdGggPyAwXG4gIHBsYWNlTG9hZGVycyA9IF9nZXREZXB0aEVsZW1lbnRzKEAsIEBkZXB0aClcblxuICBpZiBvcHRpb25zLmN1c3RvbUVsZW1lbnRcbiAgICBjdXN0b21FbGVtZW50ID0gb3B0aW9ucy5jdXN0b21FbGVtZW50XG4gIGVsc2VcbiAgICBjdXN0b21FbGVtZW50ID0gZXhwb3J0cy5kZWZhdWx0RWxlbWVudFxuXG4gIGlmIG9wdGlvbnMuY3VzdG9tQW5pbWF0aW9uXG4gICAgY3VzdG9tQW5pbWF0aW9uID0gb3B0aW9ucy5jdXN0b21BbmltYXRpb25cbiAgZWxzZVxuICAgIGN1c3RvbUFuaW1hdGlvbiA9IGV4cG9ydHMuZGVmYXVsdEFuaW1hdGlvblxuXG4gIF9jcmVhdGVQbGFjZUhvbGRlcnMgcGxhY2VMb2FkZXJzLCBjdXN0b21FbGVtZW50LCBjdXN0b21BbmltYXRpb25cblxuTGF5ZXI6OmxvYWRlZCA9ICgpIC0+XG4gIGlmIEBwbGFjZWhvbGRlclBhcmVudFxuICAgIHBsYWNlTG9hZGVycyA9IFtALnBhcmVudF1cbiAgZWxzZVxuICAgIGxheWVycyA9IEBkZXNjZW5kYW50c1xuICAgIHBsYWNlTG9hZGVycyA9IF8uZmlsdGVyIGxheWVycywgKGxheWVyKSAtPlxuICAgICAgaWYgbGF5ZXIubmFtZSBpcyBcInBsYWNlaG9sZGVyXCIgdGhlbiB0cnVlXG5cbiAgZm9yIGxheWVyIGluIHBsYWNlTG9hZGVyc1xuICAgIF9zdGFydEFuaW1hdGVMb2FkZWQobGF5ZXIpXG5cbmV4cG9ydHMubG9hZGVkQWxsID0gKG9wdGlvbnM9e30pIC0+XG4gIGRlbGF5ID0gb3B0aW9ucy5kZWxheSA/IDAuNVxuXG4gIGxheWVycyA9IEZyYW1lci5DdXJyZW50Q29udGV4dC5fbGF5ZXJzXG4gIHBsYWNlTG9hZGVycyA9IF8uZmlsdGVyIGxheWVycywgKGxheWVyKSAtPlxuICAgIGlmIGxheWVyLm5hbWUgaXMgXCJwbGFjZWhvbGRlclwiIHRoZW4gdHJ1ZVxuXG4gIG5ld0RlbGF5ID0gZGVsYXlcbiAgZm9yIGxheWVyIGluIHBsYWNlTG9hZGVyc1xuICAgIF9zdGFydEFuaW1hdGVMb2FkZWQobGF5ZXIsIG5ld0RlbGF5KVxuICAgIG5ld0RlbGF5ID0gbmV3RGVsYXkgKyBkZWxheVxuXG5leHBvcnRzLmRlZmF1bHRFbGVtZW50ID0gKGxheWVyKSAtPlxuICByZXR1cm4gX2RyYXdUZW1wbGF0ZUxheWVyKGxheWVyKVxuXG5leHBvcnRzLmRlZmF1bHRBbmltYXRpb24gPSAobGF5ZXIsIHBsYWNlaG9sZGVyLCBkZWxheSkgLT5cbiAgcmV0dXJuIF9zaG93QW5pbWF0aW9uKGxheWVyLCBwbGFjZWhvbGRlciwgZGVsYXkpIiwiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFDQUE7QURDQSxJQUFBOztBQUFBLGlCQUFBLEdBQW9CLFNBQUMsT0FBRCxFQUFVLEtBQVY7QUFDbEIsTUFBQTtFQUFBLFlBQUEsR0FBZSxDQUFDLE9BQUQ7RUFDZixDQUFBLEdBQUk7QUFDSixTQUFNLENBQUEsR0FBSSxLQUFWO0lBQ0UsU0FBQSxHQUFZO0FBQ1osU0FBQSw4Q0FBQTs7TUFDRSxJQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBZixHQUF3QixDQUEzQjtRQUNFLFlBQUEsR0FBZSxLQUFLLENBQUMsU0FEdkI7O0FBREY7SUFHQSxDQUFBO0VBTEY7QUFPQSxTQUFPO0FBVlc7O0FBWXBCLG1CQUFBLEdBQXNCLFNBQUMsV0FBRDtTQUNwQixXQUFXLENBQUMsT0FBWixDQUFBO0FBRG9COztBQUd0QixZQUFBLEdBQWUsU0FBQyxZQUFEO0FBQ2IsTUFBQTtFQUFBLElBQUEsR0FBTyxZQUFZLENBQUM7RUFDcEIsWUFBWSxDQUFDLE1BQWIsR0FBc0IsSUFBSSxDQUFDO0VBQzNCLFlBQVksQ0FBQyxDQUFiLEdBQWlCLElBQUksQ0FBQztFQUN0QixZQUFZLENBQUMsQ0FBYixHQUFpQixJQUFJLENBQUM7RUFFdEIsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDO0VBQzNCLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQztFQUMzQixPQUFPLFlBQVksQ0FB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

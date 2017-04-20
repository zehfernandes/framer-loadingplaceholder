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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3plaGZlcm5hbmRlcy9TaXRlcy9mcmFtZXItbG9hZGluZ3BsYWNlaG9sZGVyL2ZhY2Vib29rLWV4YW1wbGUuZnJhbWVyL21vZHVsZXMvTG9hZGluZ1BsYWNlaG9sZGVyLmNvZmZlZSIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIyBGdW5jdGlvbnNcbl9nZXREZXB0aEVsZW1lbnRzID0gKGVsZW1lbnQsIGRlcHRoKSAtPlxuICBwbGFjZUxvYWRlcnMgPSBbZWxlbWVudF1cbiAgaSA9IDBcbiAgd2hpbGUgaSA8IGRlcHRoXG4gICAgd2hhdGluZWVkID0gW11cbiAgICBmb3IgbGF5ZXIgaW4gcGxhY2VMb2FkZXJzXG4gICAgICBpZiBsYXllci5jaGlsZHJlbi5sZW5ndGggPiAwXG4gICAgICAgIHBsYWNlTG9hZGVycyA9IGxheWVyLmNoaWxkcmVuXG4gICAgaSsrXG5cbiAgcmV0dXJuIHBsYWNlTG9hZGVyc1xuXG5fZGVzdHJveVBsYWNlSG9sZGVyID0gKHBsYWNlaG9sZGVyKSAtPlxuICBwbGFjZWhvbGRlci5kZXN0cm95KClcblxuX2Rlc3Ryb3lNYXNrID0gKGN1cnJlbnRMYXllcikgLT5cbiAgbWFzayA9IGN1cnJlbnRMYXllci5wYXJlbnRcbiAgY3VycmVudExheWVyLnBhcmVudCA9IG1hc2sucGFyZW50XG4gIGN1cnJlbnRMYXllci54ID0gbWFzay54XG4gIGN1cnJlbnRMYXllci55ID0gbWFzay55XG5cbiAgbWFzay5kZXN0cm95KClcblxuX3N0YXJ0QW5pbWF0ZUxvYWRlZCA9IChsYXllciwgZGVsYXkpIC0+XG4gIGN1cnJlbnRMYXllciA9IGxheWVyLmNoaWxkcmVuWzFdXG4gIHBsYWNlaG9sZGVyID0gbGF5ZXIuY2hpbGRyZW5bMF1cblxuICBjdXJyZW50TGF5ZXIuYW5pbWF0ZSBcInBsYWNlaG9sZGVyT3V0XCIsXG4gICAgZGVsYXk6IGRlbGF5XG4gIHBsYWNlaG9sZGVyLmFuaW1hdGUgXCJwbGFjZWhvbGRlck91dFwiLFxuICAgIGRlbGF5OiBkZWxheVxuXG4gIGN1cnJlbnRMYXllci5vbiBFdmVudHMuQW5pbWF0aW9uRW5kLCAtPlxuICAgIF9kZXN0cm95TWFzayhjdXJyZW50TGF5ZXIpXG4gIHBsYWNlaG9sZGVyLm9uIEV2ZW50cy5BbmltYXRpb25FbmQsIC0+XG4gICAgX2Rlc3Ryb3lQbGFjZUhvbGRlcihwbGFjZWhvbGRlcilcblxuIyBEcmF3aW5nXG5fZHJhd1RlbXBsYXRlTGF5ZXIgPSAobGF5ZXIpIC0+XG5cbiAgcGxhY2Vob2xkZXIgPSBuZXcgTGF5ZXJcbiAgICB3aWR0aDogbGF5ZXIud2lkdGhcbiAgICBoZWlnaHQ6IGxheWVyLmhlaWdodFxuICAgIGJvcmRlclJhZGl1czogbGF5ZXIuYm9yZGVyUmFkaXVzXG4gICAgYmFja2dyb3VuZENvbG9yOiBcIiNlZWVlZWVcIlxuICAgIHg6IDBcbiAgICB5OiAwXG4gICAgb3BhY2l0eTogMVxuXG4gIGdyYWRpZW50ID0gbmV3IExheWVyXG4gICAgbmFtZTogXCJHcmFkaWVudFwiXG4gICAgcGFyZW50OiBwbGFjZWhvbGRlclxuICAgIGhlaWdodDogcGxhY2Vob2xkZXIuaGVpZ2h0XG4gICAgd2lkdGg6IHBsYWNlaG9sZGVyLndpZHRoICoyXG4gICAgeDogLXBsYWNlaG9sZGVyLndpZHRoXG4gICAgb3BhY2l0eTogMC43XG4gICAgc3R5bGU6XG4gICAgICBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCh0byByaWdodCwgI2VlZWVlZSAxMCUsICNkZGRkZGQgMjUlLCAjZGRkZGRkIDMwJSwgI2VlZWVlZSA0NSUpXCJcblxuICBhbmltYXRpb25Mb2FkaW5nID0gbmV3IEFuaW1hdGlvbiBncmFkaWVudCxcbiAgICB4OiBwbGFjZWhvbGRlci53aWR0aFxuICAgIHRpbWU6IDAuOVxuXG4gIGFuaW1hdGlvbkxvYWRpbmcuc3RhcnQoKVxuICBhbmltYXRpb25Mb2FkaW5nLm9uIEV2ZW50cy5BbmltYXRpb25FbmQsIC0+XG4gICAgVXRpbHMuZGVsYXkgMC40LCAtPiBhbmltYXRpb25Mb2FkaW5nLnJlc3RhcnQoKVxuXG4gIHJldHVybiBwbGFjZWhvbGRlclxuXG5fc2hvd0FuaW1hdGlvbiA9IChsYXllciwgcGxhY2Vob2xkZXIsIGRlbGF5KSAtPlxuICBsYXllci5zdGF0ZXMucGxhY2Vob2xkZXJJbiA9XG4gICAgeTogbGF5ZXIuaGVpZ2h0XG5cbiAgbGF5ZXIuc3RhdGVzLnBsYWNlaG9sZGVyT3V0ID1cbiAgICB5OiAwXG4gICAgb3B0aW9uczpcbiAgICAgIHRpbWU6IDAuMlxuICAgICAgY3VydmU6IEJlemllcigwLjI1LCAwLjEsIDAuMjUsIDEpXG4gICAgICBkZWxheTogZGVsYXlcblxuICBwbGFjZWhvbGRlci5zdGF0ZXMucGxhY2Vob2xkZXJPdXQgPVxuICAgIG9wYWNpdHk6IDBcbiAgICBvcHRpb25zOlxuICAgICAgdGltZTogMC4yXG5cbl9jcmVhdGVQbGFjZUhvbGRlcnMgPSAocGxhY2VMb2FkZXJzLCBjdXN0b21FbGVtZW50LCBjdXN0b21BbmltYXRpb24pIC0+XG4gIGRlbGF5ID0gMFxuXG4gIGZvciBsYXllciBpbiBwbGFjZUxvYWRlcnNcbiAgICBtYXNrID0gbmV3IExheWVyXG4gICAgICBuYW1lOiBcInBsYWNlaG9sZGVyXCJcbiAgICAgIHBhcmVudDogbGF5ZXIucGFyZW50XG4gICAgICB3aWR0aDogbGF5ZXIud2lkdGhcbiAgICAgIGhlaWdodDogbGF5ZXIuaGVpZ2h0XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuICAgICAgeDogbGF5ZXIueFxuICAgICAgeTogbGF5ZXIueVxuICAgICAgY2xpcDogdHJ1ZVxuICAgICAgb3BhY2l0eTogMVxuXG4gICAgcGxhY2Vob2xkZXIgPSBjdXN0b21FbGVtZW50KGxheWVyKVxuICAgIHBsYWNlaG9sZGVyLnBhcmVudCA9IG1hc2tcblxuICAgIGxheWVyLnggPSAwXG4gICAgbGF5ZXIueSA9IDBcbiAgICBsYXllci5wYXJlbnQgPSBtYXNrXG4gICAgbGF5ZXIucGxhY2Vob2xkZXJQYXJlbnQgPSB0cnVlXG5cbiAgICBjdXN0b21BbmltYXRpb24obGF5ZXIsIHBsYWNlaG9sZGVyLCBkZWxheSlcbiAgICBsYXllci5zdGF0ZVN3aXRjaChcInBsYWNlaG9sZGVySW5cIilcblxuICAgIGRlbGF5ID0gZGVsYXkgKyAwLjFcblxuIyBNZXRob2RzXG5MYXllcjo6cGxhY2Vob2xkZXIgPSAob3B0aW9ucz17fSkgLT5cbiAgQGRlcHRoID0gb3B0aW9ucy5kZXB0aCA/IDBcbiAgcGxhY2VMb2FkZXJzID0gX2dldERlcHRoRWxlbWVudHMoQCwgQGRlcHRoKVxuXG4gIGlmIG9wdGlvbnMuY3VzdG9tRWxlbWVudFxuICAgIGN1c3RvbUVsZW1lbnQgPSBvcHRpb25zLmN1c3RvbUVsZW1lbnRcbiAgZWxzZVxuICAgIGN1c3RvbUVsZW1lbnQgPSBleHBvcnRzLmRlZmF1bHRFbGVtZW50XG5cbiAgaWYgb3B0aW9ucy5jdXN0b21BbmltYXRpb25cbiAgICBjdXN0b21BbmltYXRpb24gPSBvcHRpb25zLmN1c3RvbUFuaW1hdGlvblxuICBlbHNlXG4gICAgY3VzdG9tQW5pbWF0aW9uID0gZXhwb3J0cy5kZWZhdWx0QW5pbWF0aW9uXG5cbiAgX2NyZWF0ZVBsYWNlSG9sZGVycyBwbGFjZUxvYWRlcnMsIGN1c3RvbUVsZW1lbnQsIGN1c3RvbUFuaW1hdGlvblxuXG5MYXllcjo6bG9hZGVkID0gKCkgLT5cbiAgaWYgQHBsYWNlaG9sZGVyUGFyZW50XG4gICAgcGxhY2VMb2FkZXJzID0gW0AucGFyZW50XVxuICBlbHNlXG4gICAgbGF5ZXJzID0gQGRlc2NlbmRhbnRzXG4gICAgcGxhY2VMb2FkZXJzID0gXy5maWx0ZXIgbGF5ZXJzLCAobGF5ZXIpIC0+XG4gICAgICBpZiBsYXllci5uYW1lIGlzIFwicGxhY2Vob2xkZXJcIiB0aGVuIHRydWVcblxuICBmb3IgbGF5ZXIgaW4gcGxhY2VMb2FkZXJzXG4gICAgX3N0YXJ0QW5pbWF0ZUxvYWRlZChsYXllcilcblxuZXhwb3J0cy5sb2FkZWRBbGwgPSAob3B0aW9ucz17fSkgLT5cbiAgZGVsYXkgPSBvcHRpb25zLmRlbGF5ID8gMC41XG5cbiAgbGF5ZXJzID0gRnJhbWVyLkN1cnJlbnRDb250ZXh0Ll9sYXllcnNcbiAgcGxhY2VMb2FkZXJzID0gXy5maWx0ZXIgbGF5ZXJzLCAobGF5ZXIpIC0+XG4gICAgaWYgbGF5ZXIubmFtZSBpcyBcInBsYWNlaG9sZGVyXCIgdGhlbiB0cnVlXG5cbiAgbmV3RGVsYXkgPSBkZWxheVxuICBmb3IgbGF5ZXIgaW4gcGxhY2VMb2FkZXJzXG4gICAgX3N0YXJ0QW5pbWF0ZUxvYWRlZChsYXllciwgbmV3RGVsYXkpXG4gICAgbmV3RGVsYXkgPSBuZXdEZWxheSArIGRlbGF5XG5cbmV4cG9ydHMuZGVmYXVsdEVsZW1lbnQgPSAobGF5ZXIpIC0+XG4gIHJldHVybiBfZHJhd1RlbXBsYXRlTGF5ZXIobGF5ZXIpXG5cbmV4cG9ydHMuZGVmYXVsdEFuaW1hdGlvbiA9IChsYXllciwgcGxhY2Vob2xkZXIsIGRlbGF5KSAtPlxuICByZXR1cm4gX3Nob3dBbmltYXRpb24obGF5ZXIsIHBsYWNlaG9sZGVyLCBkZWxheSkiLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUNBQTtBRENBLElBQUE7O0FBQUEsaUJBQUEsR0FBb0IsU0FBQyxPQUFELEVBQVUsS0FBVjtBQUNsQixNQUFBO0VBQUEsWUFBQSxHQUFlLENBQUMsT0FBRDtFQUNmLENBQUEsR0FBSTtBQUNKLFNBQU0sQ0FBQSxHQUFJLEtBQVY7SUFDRSxTQUFBLEdBQVk7QUFDWixTQUFBLDhDQUFBOztNQUNFLElBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFmLEdBQXdCLENBQTNCO1FBQ0UsWUFBQSxHQUFlLEtBQUssQ0FBQyxTQUR2Qjs7QUFERjtJQUdBLENBQUE7RUFMRjtBQU9BLFNBQU87QUFWVzs7QUFZcEIsbUJBQUEsR0FBc0IsU0FBQyxXQUFEO1NBQ3BCLFdBQVcsQ0FBQyxPQUFaLENBQUE7QUFEb0I7O0FBR3RCLFlBQUEsR0FBZSxTQUFDLFlBQUQ7QUFDYixNQUFBO0VBQUEsSUFBQSxHQUFPLFlBQVksQ0FBQztFQUNwQixZQUFZLENBQUMsTUFBYixHQUFzQixJQUFJLENBQUM7RUFDM0IsWUFBWSxDQUFDLENBQWIsR0FBaUIsSUFBSSxDQUFDO0VBQ3RCLFlBQVksQ0FBQyxDQUFiLEdBQWlCLElBQUksQ0FBQztTQUV0QixJQUFJLENBQUMsT0FBTCxDQUFBO0FBTmE7O0FBUWYsbUJBQUEsR0FBc0IsU0FBQyxLQUFELEVBQVEsS0FBUjtBQUNwQixNQUFBO0VBQUEsWUFBQSxHQUFlLEtBQUssQ0FBQyxRQUFTLENBQUEsQ0FBQTtFQUM5QixXQUFBLEdBQWMsS0FBSyxDQUFDLFFBQVMsQ0FBQSxDQUFBO0VBRTdCLFlBQVksQ0FBQyxPQUFiLENBQXFCLGdCQUFyQixFQUNFO0lBQUEsS0FBQSxFQUFPLEtBQVA7R0FERjtFQUVBLFdBQVcsQ0FBQyxPQUFaLENBQW9CLGdC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

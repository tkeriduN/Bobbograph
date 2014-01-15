class Data

  constructor: (data, @options) ->
    @data   = @formatData data
    @stats  = new Stats @data
    @points = @getPoints @data, @options, @stats
    @pixels = @getPixels @points, @options.usableWidth, @options.smoothGraph

  scalePoint: (val, min, delta, scale) ->
    scoped    = val - min
    percent   = scoped / delta
    scaled    = percent * scale

  getPoints: (data, options, stats) ->
    { usableWidth, usableHeight }   = options
    { xmin, ymin, dx, dy }          = stats
    for point in data
      x = @scalePoint point.x, xmin, dx, usableWidth
      y = @scalePoint point.y, ymin, dy, usableHeight
      new Point x, y

  formatData: (data) ->
    sortMethod = (a, b) -> a.x - b.x
    if typeof data[0] is 'number' then for val, index in data
      new Point index, val
    else if data[0] instanceof Array
      points = for val, index in data
        new Point val[0], val[1]
      points.sort sortMethod
    else if data[0] and data[0].x? and data[0].y?
      points = for val, index in data
        new Point val.x, val.y
      points.sort sortMethod

  getPixels: (points, width, curve) ->
    method = if curve then Easing.curve else Easing.linear
    pixels = new Array width
    for point in points
      if lastPoint?
        for index in [ Math.round( lastPoint.x ) .. Math.round( point.x ) ]
          pixels[ index ] = new Point index, method( index - lastPoint.x, lastPoint.y, point.y - lastPoint.y, point.x - lastPoint.x )
      lastPoint = point
    pixels
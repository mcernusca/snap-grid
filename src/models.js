export const Frame = function(x, y, width, height) {
  return {
    origin: [x, y],
    size: [width, height]
  }
}

export const Size = function(width, height) {
  return [width, height]
}

export const Origin = function(x, y) {
  return [x, y]
}

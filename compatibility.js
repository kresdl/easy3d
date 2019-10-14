let pass;
const gl = (typeof WebGL2RenderingContext === 'function') && document.createElement('canvas').getContext('webgl2');

if (gl && gl instanceof WebGL2RenderingContext) {
  const id = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, id);
  gl.renderbufferStorage(gl.RENDERBUFFER, 35056, 1, 1);
  const error = gl.getError();
  pass = error === gl.NO_ERROR;
} else {
  pass = false;
}

export const isCompatible = pass;

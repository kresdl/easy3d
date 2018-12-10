
# easy3d
![npm](https://img.shields.io/npm/v/easy3d.svg)
![npm](https://img.shields.io/npm/dm/easy3d.svg)

A 3D framework written by [kresdl](https://www.kresdl.com)

## Installation
`npm install easy3d`

## Usage
Bundle your app with a module bundler, e.g webpack.

### Examples
A simple application might look like this:
```javascript
import { Ctx, Camera } from 'easy3d';

const c = document.getElementById('canvas');
const ctx = new Ctx(c);

const { tex, vs, fs, prg, model, ubo } = ctx;

main();

async function main() {
	const texture = await tex.url('data/col.png');	//Load texture
	const vshader = await vs.url('data/v.glsl');	//Load shaders...
	const fshader = await fs.url('data/f.glsl');
	const program = prg(vshader, fshader);	//Create program from shaders
	const monkey = await model.url('data/monkey.obj');	//Load model
	const uniforms = ubo();	//Create uniformbuffer

	const cam = new Camera([300, 400, 1000], [0, 0, 0], 1, 20, 1000, 1);

	uniforms.scene.mvp = cam.matrix;	//Set shader variable
	texture.bind(0);	//Bind texture to unit 0
	ctx.draw(monkey, program);	//Draw model unsing program
}
```
Render to texture:
```javascript
...
const texture = ctx.tex(1024, 1024);
texture[0].draw(model, prg);	//Renders to texture mip level 0.
...
```
Multiple render targets:
```javascript
...
const { tex, rbo, fbo } = ctx;
ctx.ext('EXT_color_buffer_float');

const tex1 = tex(512, 512, { fmt: 'rgba16f' });
const tex2 = tex(512, 512);
const zbuf = rbo(512, 512);	//Create renderbuffer. Defaults to gl.DEPTH24_STENCIL8.
const fb = fbo();

fb[0] = tex1[0];	//Attaches tex1 mip level 0 to framebuffer color attachment point 0.
fb[1] = tex2[0];	//Attaches tex2 mip level 0 to framebuffer color attachment point 1.
fb.depth = zbuf;	//Attaches zbuf to framebuffer depth stencil attachment.
fb.draw(model, prg);
...
```
Setting multiple uniform blocks at once:
```javascript
...
const uni = ctx.ubo();

Object.assign(uni, {
	block: {
		uniform: [0, 1000, 0],
		another: cam.matrix
	},

	another: {
		uniform: [500, 0, 200],
		another: [200, 500, 600],
		aThird: [500, -400, 100]
	}
});
...
```
## GL wrappers
Abstraction classes for WebGL resources and data management.
### Ctx
WebGL context
##### Constructor
###### `new Ctx(canvas)`
`canvas`: HTMLCanvasElement

Throws `Error` if WebGL failed at creation.
##### Properties
###### `gl`
WebGL context
###### `id`
gl name
###### `paste`
Simple [program](#prg) for plain rendering of texels.
Can for copy operations conveniently be used with [quad](#quad) obtained with `ctx.quad`.
###### `quad`
Screen quad [model](#model). 4 vertices with layout consisting of screen position and texture coordinates.
Can for copy operations conveniently be used with paste [program](#prg) obtained with `ctx.paste`.
##### Methods
###### `zTest(enable)`
Enables "less or equal"-depth test and sets clear depth to 1.0.

`enable`: Boolean
###### `blend(enable)`
Enables overlay blending.

`enable`: Boolean
###### `draw(model, prg)`
Renders [model](#model) using specified [program](#prg).

`model`: [Model](#model)

`prg`: [Program](#prg)
###### `clear([color[, includedepth]])`
Clears screen.

`color`: Clear color as a component array. Default is `[0, 0, 0, 1]`.

`includedepth`: Clear depth buffer also. Default is `true`.
###### `dispose()`
Deletes all associated resources.
###### `ext(name)`
Enables a specific [extension](#extensions).

`name`: [Extension](#extensions) name
###### `fbo()`
Creates a [framebuffer](#fbo).
###### `fs(source)`
Creates a [fragment shader](#fs) from source.

`source`: Shader source string

Throws `Error` if shader failed to compile.
###### `fs.url(src)`
Returns a promise that is resolved with a [fragment shader](#fs).

`src`: URL of shader source.

Throws `Error` if shader failed to compile.
###### `model(vertices, indices, vertexLayout)`
Creates a [model](#model).

`vertices`: Vertices as an array of float.

`indices`: Indices as an array of integers.

`vertexLayout`: An integer array specifying the number of floats each attribute consists of.
###### `model.url(obj[, computeTangentFrame[, scale]])`
Returns a promise that is resolved with a [model](#model).
Vertices are laid out as `position[, texcoord][, normal[, tangent, bitangent]]`.

`computeTangentFrame`: Tangent and bitangent are calculated and added to each vertex. Requires that model contains normals. Default is `false`.

`scale`: Scale factor. Default is 1.0.
###### `prg(vs, fs)`
Creates a [program](#prg).

`vs`: [Vertex shader](#vs)

`fs`: [Fragment shader](#fs)

Throws `Error` if program failed at linking or validation stage.
###### `rbo(width, height[, format])`
Creates a [renderbuffer](#rbo).

`width`: Buffer width in pixels.

`height`: Buffer heigh in pixels.

`format`: [Buffer format](#render-buffer-internal-format). Default is `gl.DEPTH24_STENCIL8`.
###### `tex(width, height[, properties])`
Creates an empty [texture](#tex).

`width`: Texture width in pixels.

`height`: Texture height in pixels.

`properties`: Object containing texture settings.
* `fmt`: [Internal format](#texture-internal-format). Default is `gl.RGBA8`.
* `mips`: Reserve space for mip levels. Default is `false`.
* `wrap`: [Wrapping function](#texture-wrapping-function). Default is `gl.REPEAT`.

###### `tex.data(data[, properties])`
Creates a [texture](#tex) from the supplied image source.

`data`: Image data. One of:
* Uint8Array if type is gl.UNSIGNED_BYTE.
* Uint16Array if type is either gl.UNSIGNED_SHORT_5_6_5, gl.UNSIGNED_SHORT_4_4_4_4,
gl.UNSIGNED_SHORT_5_5_5_1, gl.UNSIGNED_SHORT or ext.HALF_FLOAT_OES.
* A Uint32Array if type is gl.UNSIGNED_INT or ext.UNSIGNED_INT_24_8_WEBGL.
* A Float32Array if type is gl.FLOAT.
* ImageData
* HTMLImageElement
* HTMLCanvasElement
* HTMLVideoElement
* ImageBitmap

(Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API))

`properties`: Object containing texture settings.
* `w`: If `data.width` is `undefined`. Texture width in pixels.
* `h`: If `data.height` is `undefined`. Texture height in pixels.
* `fmt`: [Internal format](#texture-internal-format). Default is `gl.RGBA8`.
* `srcFmt`: [Source format](#texture-source-format). Default is `gl.RGBA`.
* `type`: [Source data type](#texture-data-type). Default is `gl.UNSIGNED_BYTE`.
* `mips`: Generate mip levels. Default is `false`.
* `wrap`: [Wrapping function](#texture-wrapping-function). Default is `gl.REPEAT`.

###### `tex.url(url[, properties])`
Returns a promise that is resolved with a [texture](#tex).

`url`: Image URL

`properties`: Object containing texture settings.
* `fmt`: [Internal format](#texture-internal-format). Default is `gl.RGBA8`.
* `srcFmt`: [Source format](#texture-source-format). Default is `gl.RGBA`.
* `type`: [Source data type](#texture-data-type). Default is `gl.UNSIGNED_BYTE`.
* `mips`: Generate mip levels. Default is `true`.
* `wrap`: [Wrapping function](#texture-wrapping-function). Default is `gl.REPEAT`.

###### `ubo([usage])`
Creates a [uniformbuffer](#ubo) with binding points for each uniform block, by name.
Only blocks from existing programs when the uniformbuffer is created are taken into account.

`usage`: [Usage hint](#buffer-usage-hints). Default is `gl.DYNAMIC_DRAW`.
###### `vs(source)`
Creates a [vertex shader](#vs) from source string.

`source`: Shader source string

Throws `Error` if shader failed to compile.
###### `vs.url(src)`
Returns a promise that is resolved with a [vertex shader](#vs).

`src`: URL of shader source.

Throws `Error` if shader failed to compile.

### FBO
Frame buffer
##### Properties
###### `id`
gl name
###### `[attachment_point]`
Color attachment. Index `attachment_point` is a positive integer. Assignment value is a [texture level](#level) or `null`. Write-only.
###### `depth`
Depth attachment. Assignment value is a [renderbuffer](#rbo) or `null`. Write-only.
##### Methods
###### `clear([color[, includedepth]])`
Clears screen.

`color`: Clear color as a component array. Default is `[0, 0, 0, 1]`.

`includedepth`: Clear depth buffer also. Default is `true`.
###### `dispose()`
Deletes framebuffer.
###### `draw(model, prg)`
Renders to framebuffer.

`model`: [Model](#model) to render.

`prg`: [Program](#prg) to use.
###### `validate()`
Returns [framebuffer status](#framebuffer-status-codes).

### FS
Fragment shader
##### Properties
###### `id`
gl name
##### Methods
###### `dispose()`
Deletes shader.

### Level
Texture mip level
###### `draw(model, prg[, depthbuffer])`
Renders to mip level and returns this level.

`model`: [Model](#model) to render.

`prg`: [Program](#prg) to use.

`depthbuffer`: Optional [renderbuffer](#rbo) buffer for depth.

###### `clear([depthbuffer])`
Clears mip level and returns this level.

`depthbuffer`: Optional [renderbuffer](#rbo) to clear.

### Model
A vertexbuffer, an indexbuffer and a vertex array.
##### Properties
###### `cull`
Boolean enabling face culling. Default is `true`.
###### `ztest`
Boolean enabling depth buffer testing. Default is `true`.
###### `zwrite`
Boolean enabling depth buffer writing. Default is `true`.
###### `back`
Boolean for front side culling. Default is `false`.
##### Methods
###### `draw()`
Renders model.
###### `dispose()`
Deletes model and associated resources.

### Prg
Program
##### Properties
###### `id`
gl name
##### Methods
###### `dispose()`
Deletes program.
###### `use()`
Uses this program in rendering.

### RBO
Renderbuffer
##### Properties
###### `id`
gl name
##### Methods
###### `dispose()`
Deletes buffer.

### Tex
Texture
##### Properties
###### `id`
gl name
###### `[lod]`
[Texture level](#level). Index `lod` is a positive integer where 0 represents the original image. Read-only.
###### `bind(unit)`
Bind texture to unit.

`unit`: Texture unit
###### `dispose()`
Deletes texture.
###### `unbind()`
Unbinds texture from unit previously bound to.

### UBO
Uniformbuffer
##### Properties
###### `id`
gl name
###### `[block][uniform]`
Shader uniform tree.

`block`: Uniform block as defined in shader(s). Accepted value is an object containing uniform/value pairs.

`uniform`: Uniform as defined in shader block. Accepted value is either a number, a number array([vec](#vec)/[vec2](#vec2)) or an array of number arrays([matrix](#mat)). Write-only.

Throws `Error` if a block or uniform doesn't exist or if type is none of the types mentioned above.
##### Methods
###### `dispose()`
Deletes buffer.

### VS
Vertex shader
##### Properties
###### `id`
gl name
##### Methods
###### `dispose()`
Deletes shader.

###### `clear([depthbuffer])`
Clears mip level and returns this level.

`depthbuffer`: Optional [renderbuffer](#rbo) to clear.

## Vector library
Mathods for calculations on vectors and matrices.
#### 3-component vector operations
A vector is an array of length 3.
##### Methods
###### `add(a, b)`
Returns the sum of two vectors.
###### `cross(a, b)`
Returns the cross product of two vectors.
###### `div(v, d)`
Returns the resulting vector of vector `v` divided by number `d`.
###### `dot(a, b)`
Returns the dot product of two vectors.
###### `length(v)`
Returns the magnitude of a vector.
###### `lerp(a, b, p)`
Returns the interpolation of two vectors by parameter `p` (0.0 - 1.0).
###### `mul(v, f)`
Returns the resulting vector of vector `v` multiplied by number `f`.
###### `nrm(v)`
Returns the normalized vector.
###### `sub(v, b)`
Returns the difference of two vectors.
###### `tfc(coord, mat)`
Transforms a vector as a coordinate by [matrix](#mat) `mat`.
###### `tfn(normal, mat)`
Transforms a vector as a normal by [matrix](#mat) `mat`.

#### 2-component vector operations
A vector is an array of length 2.
##### Methods
###### `add2(a, b)`
Returns the sum of two vectors.
###### `cross2(a, b)`
Returns the cross product of two vectors.
###### `div2(v, d)`
Returns the resulting vector of vector `v` divided by number `d`.
###### `dot2(a, b)`
Returns the dot product of two vectors.
###### `length2(v)`
Returns the magnitude of a vector.
###### `lerp2(a, b, p)`
Returns the interpolation of two vectors by parameter `p` (0.0 - 1.0).
###### `mul2(v, f)`
Returns the resulting vector of vector `v` multiplied by number `f`.
###### `nrm2(v)`
Returns the normalized vector.
###### `sub2(a, b)`
Returns the difference of two vectors.

#### Matrix operations
 A matrix is  a 4*4 cell array construction of format [row][column].
 ##### Methods
###### `rotate(x, y, z)`
Returns a matrix for rotation around x, y and z axes.

`x`, `y` and `z`: Rotation angle in radians around axis.
###### `rotateX(r)`
Returns a matrix for rotation around x axis.

`r`: Rotation angle in radians.
###### `rotateY(r)`
Returns a matrix for rotation around y axis.

`r`: Rotation angle in radians.
###### `rotateZ(r)`
Returns a matrix for rotation around z axis.

`r`: Rotation angle in radians.
###### `scale(x, y, z)`
Returns a scaling matrix.

`x`, `y` and `z`: Scaling factor for axis.
###### `translate(x, y, z)`
Returns a translation matrix.

`x`, `y` and `z`: Translation for axis.
###### `arb(a, b, r)`
Returns a matrix for rotation by `r` radians around an arbitrary axis defined by point `a` and `b`.

###### `view(pos, target)`
Returns a view matrix.

`pos`: Observer position

`target`: Observation target position.
###### `glView(pos, target)`
Same as [view](#array-mat-view-pos-lookat-) but adapted to gl space.
###### `proj(zNear, zFar, fov, aspectRatio)`
Returns a perspective matrix.

`zNear`: Near clipping plane

`zFar`: Far clipping plane

`fov`: Field of View in radians.

`aspectRatio`: Viewport width / height ratio
###### `glProj(zNear, zFar, fov, aspectRatio)`
Same as [proj](#array-mat-proj-znear-zfar-fov-aspectratio-) but adapted to gl space.
###### `concat(a, b)`
Returns the concatenation of two matrices.

`a` and `b`: Matrix
###### `inverse(m)`
Returns the inverse matrix.

`m`: Matrix to inverse.
###### `transpose(m)`
Returns the transpose matrix.

`m`: Matrix to transpose.

### Camera
Convenience class for setup and management of view and perspective matrices
##### Properties
###### `view`
View matrix
###### `proj`
Perspective matrix
###### `matrix`
View and perspective concatenated matrix. Lazily calculated.
##### Constructor
###### `new Camera(pos, lookAt, aspectRatio, zNear, zFar, fov[, glSpace])`

`pos`: Observer position

`target`: Observation target position.

`aspectRatio`: Viewport width / height ratio

`zNear`: Near clipping plane

`zFar`: Far clipping plane

`fov`: Field of View in radians.

`glSpace`: Use gl matrices adapted to gl space. Default is `true`.
##### Methods
###### `move(pos, target)`
Relocates and reorients camera.

`pos`: Observer position.

`target`: Observation target position.

## GLenums
GLenum parameters in context methods can be substituted by a string where underscore("_") is replaced by dash("-") and all letters are decapitalized.
For example, `gl.UNSIGNED_BYTE` becomes `'unsigned-byte'`.
### Renderbuffer internal format
* gl.RGBA4: 4 red bits, 4 green bits, 4 blue bits 4 alpha bits.
* gl.RGB565: 5 red bits, 6 green bits, 5 blue bits.
* gl.RGB5_A1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
* gl.DEPTH_COMPONENT16: 16 depth bits.
* gl.STENCIL_INDEX8: 8 stencil bits.
* gl.DEPTH_STENCIL
* gl.R8
* gl.R8UI
* gl.R8I
* gl.R16UI
* gl.R16I
* gl.R32UI
* gl.R32I
* gl.RG8
* gl.RG8UI
* gl.RG8I
* gl.RG16UI
* gl.RG16I
* gl.RG32UI
* gl.RG32I
* gl.RGB8
* gl.RGBA8
* gl.SRGB8_ALPHA8
* gl.RGB10_A2
* gl.RGBA8UI
* gl.RGBA8I
* gl.RGB10_A2UI
* gl.RGBA16UI
* gl.RGBA16I
* gl.RGBA32I
* gl.RGBA32UI
* gl.DEPTH_COMPONENT24
* gl.DEPTH_COMPONENT32F
* gl.DEPTH24_STENCIL8
* gl.DEPTH32F_STENCIL8

When using the EXT_color_buffer_float extension:

* gl.R16F
* gl.RG16F
* gl.RGBA16F
* gl.R32F
* gl.RG32F
* gl.RGBA32F
* gl.R11F_G11F_B10F

### Texture internal format
* gl.R8
* gl.R16F
* gl.R32F
* gl.R8UI
* gl.RG8
* gl.RG16F
* gl.RG32F
* gl.RG8UI
* gl.RG16UI
* gl.RG32UI
* gl.RGB8
* gl.SRGB8
* gl.RGB565
* gl.R11F_G11F_B10F
* gl.RGB9_E5
* gl.RGB16F
* gl.RGB32F
* gl.RGB8UI
* gl.RGBA8
* gl.SRGB8_APLHA8
* gl.RGB5_A1
* gl.RGB10_A2
* gl.RGBA4
* gl.RGBA16F
* gl.RGBA32F
* gl.RGBA8UI

### Texture source format
* gl.RED
* gl.RG
* gl.RGB
* gl.RGBA
* gl.ALPHA
* gl.RGBA_INTEGER
* gl.LUMINANCE
* gl.LUMINANCE_ALPHA

### Texture data type
* gl.UNSIGNED_BYTE: 8 bits per channel for gl.RGBA
* gl.UNSIGNED_SHORT_5_6_5: 5 red bits, 6 green bits, 5 blue bits.
* gl.UNSIGNED_SHORT_4_4_4_4: 4 red bits, 4 green bits, 4 blue bits, 4 alpha bits.
* gl.UNSIGNED_SHORT_5_5_5_1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
* gl.BYTE
* gl.UNSIGNED_SHORT
* gl.SHORT
* gl.UNSIGNED_INT
* gl.INT
* gl.HALF_FLOAT
* gl.FLOAT
* gl.UNSIGNED_INT_2_10_10_10_REV
* gl.UNSIGNED_INT_10F_11F_11F_REV
* gl.UNSIGNED_INT_5_9_9_9_REV
* gl.UNSIGNED_INT_24_8
* gl.FLOAT_32_UNSIGNED_INT_24_8_REV (pixels must be null)

### Texture wrapping function
* gl.REPEAT
* gl.CLAMP_TO_EDGE
* gl.MIRRORED_REPEAT

### Shader type
* gl.VERTEX_SHADER
* gl.FRAGMENT_SHADER

### Buffer types
* gl.ARRAY_BUFFER: Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color data.
* gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
* gl.COPY_READ_BUFFER: Buffer for copying from one buffer object to another.
* gl.COPY_WRITE_BUFFER: Buffer for copying from one buffer object to another.
* gl.TRANSFORM_FEEDBACK_BUFFER: Buffer for transform feedback operations.
* gl.UNIFORM_BUFFER: Buffer used for storing uniform blocks.
* gl.PIXEL_PACK_BUFFER: Buffer used for pixel transfer operations.
* gl.PIXEL_UNPACK_BUFFER: Buffer used for pixel transfer operations.

### Buffer usage hints
* gl.STATIC_DRAW: Contents of the buffer are likely to be used often and not change often. Contents are written to the buffer, but not read.
* gl.DYNAMIC_DRAW: Contents of the buffer are likely to be used often and change often. Contents are written to the buffer, but not read.
* gl.STREAM_DRAW: Contents of the buffer are likely to not be used often. Contents are written to the buffer, but not read.
* gl.STATIC_READ: Contents of the buffer are likely to be used often and not change often. Contents are read from the buffer, but not written.
* gl.DYNAMIC_READ: Contents of the buffer are likely to be used often and change often. Contents are read from the buffer, but not written.
* gl.STREAM_READ: Contents of the buffer are likely to not be used often. Contents are read from the buffer, but not written.
* gl.STATIC_COPY: Contents of the buffer are likely to be used often and not change often. Contents are neither written or read by the user.
* gl.DYNAMIC_COPY: Contents of the buffer are likely to be used often and change often. Contents are neither written or read by the user.
* gl.STREAM_COPY: Contents of the buffer are likely to be used often and not change often. Contents are neither written or read by the user.

### Framebuffer status codes
* gl.FRAMEBUFFER_COMPLETE: The framebuffer is ready to display.
* gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.
* gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: There is no attachment.
* gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: Height and width of the attachment are not the same.
* gl.FRAMEBUFFER_UNSUPPORTED: The format of the attachment is not supported or if depth and stencil attachments are not the same renderbuffer.
* gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: The values of gl.RENDERBUFFER_SAMPLES are different among attached renderbuffers, or are non-zero if the attached images are a mix of renderbuffers and textures.

Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)


## Extensions
* EXT_color_buffer_float

    The following sized formats become color-renderable:

	gl.R16F,
	gl.RG16F,
	gl.RGBA16F,
	gl.R32F,
	gl.RG32F,
	gl.RGBA32F,
	gl.R11F_G11F_B10F.

    Color-renderable means:
	The WebGLRenderingContext.renderbufferStorage() method now accepts these formats.
	Framebuffers with attached textures of these formats may now be FRAMEBUFFER_COMPLETE.

* EXT_texture_filter_anisotropic

    Part of the WebGL API and exposes two constants for anisotropic filtering (AF).
    AF improves the quality of mipmapped texture access when viewing a textured primitive at an oblique angle. Using just mipmapping, these lookups have a tendency to average to grey.

    Constants
    * ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT
    This is the pname argument to the gl.getParameter() call, and it returns the maximum available anisotropy.
    * ext.TEXTURE_MAX_ANISOTROPY_EXT
    This is the pname argument to the gl.getTexParameter() and gl.texParameterf() / gl.texParameteri() calls and sets the desired maximum anisotropy for a texture.


* OES_texture_float_linear

    Allows linear filtering with floating-point pixel types for textures.
    With the help of this extension, you can now set the magnification or minification filter in the WebGLRenderingContext.texParameter() method to one of gl.LINEAR, gl.LINEAR_MIPMAP_NEAREST, gl.NEAREST_MIPMAP_LINEAR, or gl.LINEAR_MIPMAP_LINEAR, and use floating-point textures.

* OES_texture_half_float_linear

    Allows linear filtering with half floating-point pixel types for textures.

* WEBGL_debug_renderer_info

    Exposes two constants with information about the graphics driver for debugging purposes.
    Depending on the privacy settings of the browser, this extension might only be available to privileged contexts. Generally, the graphics driver information should only be used in edge cases to optimize your WebGL content or to debug GPU problems. The WebGLRenderingContext.getParameter() method can help you to detect which features are supported and the failIfMajorPerformanceCaveat context attribute lets you control if a context should be returned at all, if the performance would be dramatically slow.

    Constants
	* ext.UNMASKED_VENDOR_WEBGL
	Vendor string of the graphics driver.
	* ext.UNMASKED_RENDERER_WEBGL
	Renderer string of the graphics driver.


* WEBGL_debug_shaders

    Exposes a method to debug shaders from privileged contexts.
    This extension is not directly available to web sites as the way of how the shader is translated may uncover personally-identifiable information to the web page about the kind of graphics card in the user's computer.

    Methods
	* WEBGL_debug_shaders.getTranslatedShaderSource()
	Returns the translated shader source.


* WEBGL_lose_context

	Exposes functions to simulate losing and restoring a WebGLRenderingContext.

	Methods
	* WEBGL_lose_context.loseContext()
	Simulates losing the context.
	* WEBGL_lose_context.restoreContext()
	Simulates restoring the context.

Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

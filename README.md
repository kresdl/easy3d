

# easy3d
![npm](https://img.shields.io/npm/v/easy3d.svg)
![npm](https://img.shields.io/npm/dm/easy3d.svg)

A 3D framework written by [kresdl](https://www.kresdl.com)

#### Concept

What easy3d 3.0 is trying to accomplish is to provide a more declarative way of creating 3D graphics.

#### Installation

`npm install easy3d`

#### Usage

Bundle your app with a module bundler, e.g webpack.

#### Example

A simple app might look like this:

```javascript
import { Camera, createScene, rotate, concat } from 'easy3d';
init();

async function init() {
  const vp = new Camera([0, 0, 165], [0, 0, 0], 1, 25, 1000, 1).matrix,

  setup = {
    em: 'canvas',
    width: 1024,
    height: 1024,
    assets: {
      prg: { fx: ['/data/monkey_v.glsl', '/data/monkey_f.glsl'] },
      mesh: { monkey: '/data/monkey.obj' },
      tex: { fur: '/data/monkey.png' }
    }
  },

  { render } = await createScene(setup);
  var mx = 0, my = 0;
  main();

  function main() {
    render({
      prg: 'fx',
      uni: {
        mvp: concat(rotate(my * 0.005, -mx * 0.005, 0), vp)
      },
      mesh: 'monkey',
      tex: 'fur'
    });
    mx += 4.0;
    my += 5.0;
    requestAnimationFrame(main)
  }
}
```

Feel free to play around with the sample app contained in this package.

### Scene
Abstraction class for asset management, uniforms handling and render procedure logic. It is provided by the utility method [createScene](#utility-methods).

##### Properties:

**`canvas`**: `HTMLCanvasElement`

**`assets`**: `Object` containing the [assets](#assets). Has the the same structure as [asset descriptions](#asset-descriptions) with the exception that shaders are absent.

**`uni`**: [Shader uniforms](#shader-uniform-tree). Write only.

**`statics`**: User data.

##### Methods:

**`render(arg)`**

Runs [scheme](#scheme).

`arg`: [Scheme](#scheme) or `Object`. If `Object`, the main scheme is executed and is passed this argument. If no main scheme is assigned, the argument is invoked as a [directive](#directive).

## Assets

### Program



##### Methods:

**`drop()`**

Marks asset as obsolete after next [directive](#directive) invokation and that it should be disposed. Returns this asset.

### Mesh
##### Properties:

**`cull`**: `Boolean` dictating face culling. Default is `true`.

**`ztest`**: `Boolean` dictating depth buffer testing. Default is `true`.

**`zwrite`**: `Boolean` dictating depth buffer writing. Default is `true`.

**`back`**: `Boolean` to use front side culling. Default is `false`.

##### Methods:

**`drop()`**

Marks asset as obsolete after next [directive](#directive) invokation and that it should be disposed. Returns this asset.
### Texture
##### Properties:

**`[lod]`**: [Level](#level). `lod` is a positive integer where 0 represents the original image. Read-only.
##### Methods:

**`drop()`**

Marks asset as obsolete after next [directive](#directive) invokation and that it should be disposed. Returns this asset.

**`mip()`**

Generates mip levels and returns this texture.

### Render buffer
##### Methods:

**`drop()`**

Marks asset as obsolete after next [directive](#directive) invokation and that it should be disposed. Returns this asset.

## Items

### Setup
`Object` responsible for scene initialization.

* `em`: `HTMLCanvasElement` id.

* `width`: Width in pixels.

* `height`: Height in pixels.

* `assets`: [Asset descriptions](#asset-descriptions).

* `scheme`: Optional main [scheme](#scheme).

* `ext`: `String` or `Array`. Optional [extension(s)](#extensions) to use.

* `uni`: Optional [shader uniform](#shader-uniform-tree) initialization.

* `statics`: Optional user data.

### Asset descriptions

`Object`. Descriptions of [assets](#assets) which will be resolved with actual assets to be associated with the scene, grouped by type. The groups are:

* `vs`: `Object`. Vertex shader descriptions by name.  A description is a URL `String` or an `Array` consisting of a URL and an [alias mapper](#alias-mapper). The name can be referenced from `prg` group which allows recycling of shaders shared among different programs.

* `fs`: Fragment shaders. Similar to `vs`.

* `prg`: `Object`. [Program](#program) descriptions by name. A description is an `Array` or a `String`. Accepted values are the same as for `vs` and `fs` respectively, as well as references to `keys` of these groups. If the vertex shader component is omitted, the program will be created with a [screen quad vertex shader](#screen-quad-vertex-shader).

* `tex`: `Object`. By name, either a [texture](#tex) description or a `Function` providing an `Iterable` of descriptions, which will result in an `Array` of textures.
A description can be a URL `String`, [image data](#image-data) or an `Array`. An empty texture is defined by width and height respectively. The information can be followed by [options](#texture-options).

* `mesh`: `Object`. [Mesh](#mesh) descriptions by name. A description is a `String` or an `Array` consisting of a URL to an `.obj`-file, optionally followed by a `Boolean` dictating generation of tangent and bitangent for each vertex, given a normal exists. This is done by default.

* `rbo`: `Object`. [Render buffer](#render-buffer) descriptions by name. A description is an `Array` of width, height and [format](#renderbuffer-internal-format). Default format is `gl.DEPTH24_STENCIL8`.

### Level

The render target at a certain detail level (lod) of a [texture](#texture).

### Alias mapper

`Object` passed at shader creation with which to resolve aliases contained in shader source.

An alias is a word prefixed with `$`. It is mapped to a text fragment before compilation. If suffixed with `.f` it is considered a float and is casted accordingly.

Example:
```javascript
//main.js 
//assets object
...
    fs: {
      blurx: ['/texy/data/shader.glsl', { x: 10 }]
    },
...

```
```javascript
//shader.glsl
...
const float x = $x.f;
//Results in
//const float x = 10.0;
...
```

### Shader uniform tree
`Object` for assigning shader `uniforms`. Contains all uniforms present in compiled shaders, grouped by `block`.
* `block`: Block as defined in shader(s). Accepted value is either a uniform or in the case of a single uniform containing block, the uniform value directly.
* `uniform`: Uniform as defined in shader block. Accepted value is either a `Number`, a `Number` `Array` or an `Array` of `Number` arrays ([matrix](#matrix)).

### Texture options
`Object` defining texture.

* `w`: If `width` is unavailable on source. Texture width in pixels
* `h`: If `height` is unavailable on source. Texture height in pixels
* `fmt`: [Internal format](#texture-internal-format). Default `gl.RGBA8`.
* `srcFmt`: [Source format](#texture-source-format). Default is `gl.RGBA`.
* `type`: [Source data type](#texture-data-type). Default is `gl.UNSIGNED_BYTE`.
* `mips`: A `Boolean` dictates the generation/storage reservation of/for mip levels. A `Number` specifies the amount of levels. Default is `false` for empty textues and `true` for non-empty.
* `wrap`: [Wrapping function](#texture-wrapping-function). Default is `gl.REPEAT`.

### Color

`Array` of values between `0.0` and `1.0`. Elements map to buffer format.

### Vector

A `Number` `Array` of length `2` or `3`.

### Matrix

A 4x4 `Number` `Array` construction of format `[column][row]`.

### Blend modes

`String`. Can be `'over'`, `'atop'`, `'in'`, `'out'`, `'dest over'`, `'dest atop'`, `'dest in'` or `'dest out'`.

###  Directive

`Object` describing a render pass. [Assets](#assets) can be referenced with a `String` corresponding to the name defined in [asset descriptions](#asset-descriptions).

* `prg`: Program to use. Either a [program](#program) or a `String`. Default is [paste](#paste-program).

* `mesh`: Mesh to draw. Either a [mesh](#mesh) or a `String`. Default is [quad](#screen-quad).

* `uni`: [Shader uniform tree](#shader-uniform-tree)

* `clear`: Clear before draw. A `Boolean` dictates color- and depth clear.  `true` sets clear [color](#color) to `[0, 0, 0, 1]` if target is the back buffer, or `[0, 0, 0, 0]` if target is a [level](#level). Furthermore, it sets clear depth to `1.0`. `false` disables clear. An `Array` specifies clear values and consists of a clear color, or in case of multiple targets, an `Array` of clear colors, followed by a clear depth. Default is `false`.

* `blend`: `Boolean` or [blend mode](#blend-mode). `true` enables `'over'` blend mode and `false` disables blending. Default is `false`.

* `tex`: `Object`,  `Array`, [texture](#tex), or `String`.
If  `Object`, `key` is a sampler as defined in the fragment shader of the [program](#program) and `value` is a [texture](#tex) or a `String`.
If  `Array`, each sampler is assigned a texture with index corresponding to the order of the sampler's declaration in the fragment shader.
If the program contains a single sampler, the texture can be assigned directly.

* `tg`: Render target(s) if other than the back buffer. Either a [level](#level), a [texture](#tex) or a `String`, alternatively an `Array` of any of these. References are considered texture references and textures will be targeted at level 0.

* `z`: Depth buffer if other than the back buffer's. Either a [render buffer](#render-buffer) or a `String`.

If neither `tex` or `prg` is defined the target(s) will be cleared.

### Scheme

A `Function` that returns an `Iterable` of [directives](#directive). By defining a generator function, intermediate operations can be performed between render passes. The [scene](#scene) can be accessed with the `this` keyword.

Example:
```javascript
function* scheme(mvp) {
  const { tex } = this.assets;

  yield {
    prg: 'vcol',
    mesh: 'monkey',
    uni: { mvp },
    clear: true,
    tg: ['col', 'halo'],
    z: 'z'
  };

  yield {
    prg: 'blurx',
    tex: tex.halo.mip(),
    tg: 'bx'
  };

  yield {
    prg: 'blury',
    tex: {
      a: 'bx',
      b: 'col'
    }
  };
}
```
## Utility assets

### Screen quad

[Mesh](#mesh) consisting of four vertices laid out in a rectangle. Each vertex has a texture coordinate attribute. For use in render operations to target the entire surface of the destination.

### Paste program

Program that together with a [screen quad](#screen-quad) copies the texture in sampler `tex` to the destination.

### Screen quad vertex shader

The vertex shader component of [Paste](#paste). Position is treated as a screen space coordinate which means that no perspective is applied.
The texture coordinate attribute is passed to the fragment shader `in` data `f_tex`.

## Utility classes

### Camera
Convenience class for setup and handling of view- and perspective matrices
##### Properties:

**`view`**: View matrix

**`proj`**: Perspective matrix

**`matrix`**: View and perspective concatenated matrix. Lazily calculated.
##### Constructor:

**`new Camera(pos, lookAt, aspectRatio, zNear, zFar, fov[, glSpace])`**


`pos`: Observer position

`target`: Observation target position.

`aspectRatio`: Viewport width / height ratio

`zNear`: Near clipping plane

`zFar`: Far clipping plane

`fov`: Field of View in radians.

`glSpace`: Use gl matrices adapted to gl space. Default is `true`.
##### Methods:

**`move(pos, target)`**

Relocates and reorients camera.

`pos`: Observer position.

`target`: Observation target position.

## Vector library

#### Methods for calculations on [3D-vectors](#vector):

**`add(a, b)`**

Returns the sum of two vectors.

**`cross(a, b)`**

Returns the cross product of two vectors.

**`div(v, d)`**

Returns the resulting vector of vector `v` divided by `Number` `d`.

**`dot(a, b)`**

Returns the dot product of two vectors.

**`length(v)`**

Returns the magnitude of a vector.

**`lerp(a, b, p)`**

Returns the interpolation of two vectors by parameter `p` (`0.0` - `1.0`).

**`mul(v, f)`**

Returns the resulting vector of vector `v` multiplied by `Number` `f`.

**`nrm(v)`**

Returns the normalized vector.

**`sub(v, b)`**

Returns the difference of two vectors.

**`tfc(coord, mat)`**

Transforms a vector as a coordinate by [matrix](#matrix) `mat`.

**`tfn(normal, mat)`**

Transforms a vector as a normal by [matrix](#matrix) `mat`.

#### Methods for calculations on [2D-vectors](#vector):

**`add2(a, b)`**

Returns the sum of two vectors.

**`cross2(a, b)`**

Returns the cross product of two vectors.

**`div2(v, d)`**

Returns the resulting vector of vector `v` divided by `Number` `d`.

**`dot2(a, b)`**

Returns the dot product of two vectors.

**`length2(v)`**

Returns the magnitude of a vector.

**`lerp2(a, b, p)`**

Returns the interpolation of two vectors by parameter `p` (0.0 - 1.0).

**`mul2(v, f)`**

Returns the resulting vector of vector `v` multiplied by `Number` `f`.

**`nrm2(v)`**

Returns the normalized vector.

**`sub2(a, b)`**

Returns the difference of two vectors.

#### Methods for calculations on [matrices](#matrix):

**`rotate(x, y, z)`**

Returns a matrix for rotation around x, y and z axes.

`x`, `y` and `z`: Rotation angle in radians around axis.

**`rotateX(r)`**

Returns a matrix for rotation around x axis.

`r`: Rotation angle in radians.

**`rotateY(r)`**

Returns a matrix for rotation around y axis.

`r`: Rotation angle in radians.

**`rotateZ(r)`**

Returns a matrix for rotation around z axis.

`r`: Rotation angle in radians.

**`scale(x, y, z)`**

Returns a scaling matrix.

`x`, `y` and `z`: Scaling factor for axis.

**`translate(x, y, z)`**

Returns a translation matrix.

`x`, `y` and `z`: Translation for axis.

**`arb(a, b, r)`**

Returns a matrix for rotation by `r` radians around an arbitrary axis defined by point `a` and `b`.


**`view(pos, target)`**

Returns a view matrix.

`pos`: Observer position

`target`: Observation target position.

**`glView(pos, target)`**

Same as `view()` but adapted to gl space.

**`proj(zNear, zFar, fov, aspectRatio)`**

Returns a perspective matrix.

`zNear`: Near clipping plane

`zFar`: Far clipping plane

`fov`: Field of View in radians.

`aspectRatio`: Viewport width / height ratio

**`glProj(zNear, zFar, fov, aspectRatio)`**

Same as `proj()` but adapted to gl space.

**`concat(a, b)`**

Returns the concatenation of two matrices.

`a` and `b`: Matrix

**`inverse(m)`**

Returns the inverse matrix.

`m`: Matrix to inverse.

**`transpose(m)`**

Returns the transpose matrix.

`m`: Matrix to transpose.

## Utility methods

**`createScene(setup)`**

Returns a promise that is resolved with the [scene](#scene).

`setup`: [Setup](#setup).

Throws `Error` if WebGL failed at creation.

## GLenums
GLenum parameters in context Methods: can be substituted by a `String` where `_` is replaced by `-` and all letters are decapitalized.
For example, `gl.UNSIGNED_BYTE` becomes `'unsigned-byte'`.

**Renderbuffer internal format**

* gl.RGBA4
* gl.RGB565
* gl.RGB5_A1
* gl.DEPTH_COMPONENT16
* gl.STENCIL_INDEX8
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

**Texture internal format**

* gl.ALPHA
* gl.RGB
* gl.RGBA
* gl.LUMINANCE
* gl.LUMINANCE_ALPHA
* gl.DEPTH_COMPONENT
* gl.DEPTH_STENCIL
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

**Texture source format**

* gl.RED
* gl.RG
* gl.RGB
* gl.RGBA
* gl.ALPHA
* gl.RGBA_INTEGER
* gl.LUMINANCE
* gl.LUMINANCE_ALPHA
* gl.DEPTH_COMPONENT
* gl.DEPTH_STENCIL

**Texture data type**

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

**Texture wrapping function**

* gl.REPEAT
* gl.CLAMP_TO_EDGE
* gl.MIRRORED_REPEAT

**Shader type**

* gl.VERTEX_SHADER
* gl.FRAGMENT_SHADER

**Buffer types**

* gl.ARRAY_BUFFER: Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color data.
* gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
* gl.COPY_READ_BUFFER: Buffer for copying from one buffer object to another.
* gl.COPY_WRITE_BUFFER: Buffer for copying from one buffer object to another.
* gl.TRANSFORM_FEEDBACK_BUFFER: Buffer for transform feedback operations.
* gl.UNIFORM_BUFFER: Buffer used for storing uniform blocks.
* gl.PIXEL_PACK_BUFFER: Buffer used for pixel transfer operations.
* gl.PIXEL_UNPACK_BUFFER: Buffer used for pixel transfer operations.

**Buffer usage hints**

* gl.STATIC_DRAW: Contents of the buffer are likely to be used often and not change often. Contents are written to the buffer, but not read.
* gl.DYNAMIC_DRAW: Contents of the buffer are likely to be used often and change often. Contents are written to the buffer, but not read.
* gl.STREAM_DRAW: Contents of the buffer are likely to not be used often. Contents are written to the buffer, but not read.
* gl.STATIC_READ: Contents of the buffer are likely to be used often and not change often. Contents are read from the buffer, but not written.
* gl.DYNAMIC_READ: Contents of the buffer are likely to be used often and change often. Contents are read from the buffer, but not written.
* gl.STREAM_READ: Contents of the buffer are likely to not be used often. Contents are read from the buffer, but not written.
* gl.STATIC_COPY: Contents of the buffer are likely to be used often and not change often. Contents are neither written or read by the user.
* gl.DYNAMIC_COPY: Contents of the buffer are likely to be used often and change often. Contents are neither written or read by the user.
* gl.STREAM_COPY: Contents of the buffer are likely to be used often and not change often. Contents are neither written or read by the user.

**Framebuffer status codes**

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

    Methods:
    * WEBGL_debug_shaders.getTranslatedShaderSource()
    Returns the translated shader source.


* WEBGL_lose_context

    Exposes functions to simulate losing and restoring a WebGLRenderingContext.

    Methods:
    * WEBGL_lose_context.loseContext()
    Simulates losing the context.
    * WEBGL_lose_context.restoreContext()
    Simulates restoring the context.

Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

## Related

### Image data

Any of the following:
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

Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)

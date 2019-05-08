#version 300 es
precision mediump float;

uniform sampler2D blur;
uniform sampler2D halo;

in	vec2 f_tex;
out vec4 col;

void main() {
	col = vec4(0.65 * texture(blur, f_tex).rgb + texture(halo, f_tex).rgb, 1.0);
}

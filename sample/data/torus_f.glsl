#version 300 es
precision mediump float;

in vec3 f_col;

layout(location = 0) out vec4 col;
layout(location = 1) out vec4 halo;

void main() {
	vec3 c = f_col + f_col.gbr;
	col = vec4(c, 1.0);
	halo = vec4(2.0 * (c - 0.8), 1.0);
}

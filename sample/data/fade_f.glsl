#version 300 es
precision mediump float;

uniform sampler2D t;

in vec2 f_tex;
out vec4 col;

void main() {
	vec3 c = texture(t, f_tex).rgb;
	col = vec4(c, 0.75);
}

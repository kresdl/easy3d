#version 300 es
precision mediump float;

uniform sampler2D t;

layout(std140) uniform weights {
	float _weights[9];
};

in vec2 f_tex;
out vec4 col;

void main() {
	float d = 16.0 / 512.0;
	float offs = (1.0 - 5.0) * d;
	vec3 a = vec3(0.0, 0.0, 0.0);
	for (int i = 0; i < 9; i++) {
		a += _weights[i] * texture(t, f_tex + vec2(0.0, offs)).rgb;
		offs += d;
	}
	col = vec4(a, 1.0);
}

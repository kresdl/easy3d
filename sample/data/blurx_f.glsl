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
	vec4 a = vec4(0.0, 0.0, 0.0, 0.0);
	for (int i = 0; i < 9; i++) {
		a += _weights[i] * textureLod(t, f_tex + vec2(offs, 0.0), 5.0);
		offs += d;
	}
	col = a;
}

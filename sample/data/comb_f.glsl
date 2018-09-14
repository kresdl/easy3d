#version 300 es
precision mediump float;

uniform f1 {
	float size;
};

uniform sampler2D t1;
uniform sampler2D t2;
uniform sampler2D t3;
uniform sampler2D t4;
uniform sampler2D t5;
uniform sampler2D t6;
uniform sampler2D t7;
uniform sampler2D t8;
uniform sampler2D t9;
uniform sampler2D t10;

in vec2 f_tex;
out vec4 frag;

vec2 g(sampler2D s, float mag) {
	vec3 q = texture(s, f_tex).xyz;
	return mag * q.z * normalize(vec2(2.0 * q.xy - 1.0));
}

vec2 g2(sampler2D s, float mag) {
	vec3 q = texture(s, f_tex.yx).xyz;
	return mag * q.z * normalize(vec2(2.0 * q.xy - 1.0));
}

void main() {
	vec2 v = g(t1, 5.0);
	v += g2(t1, 10.0);
	v += g(t2, 4.0);
	v += g(t3, 3.0);
	v += g(t4, 3.0);
	v += g(t5, 2.0);
	v += g(t6, 2.0);
	v += g(t7, 2.0);
	v += g(t8, 3.0);
	v += g(t9, 4.0);
	v += g(t10, 5.0);
	vec2 t = v / (10.0 * size);
	float d = min(1.0, 1.9 * pow(length(t), 0.08));
	frag = vec4(t, d, 1.0);
}

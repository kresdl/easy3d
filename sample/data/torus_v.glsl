#version 300 es

uniform mvp {
	mat4 _mvp;
};

in vec3 pos;
out vec3 f_col;

void main() {
	f_col = 0.005 * pos + 0.5;
	gl_Position = _mvp * vec4(pos, 1.0);
}

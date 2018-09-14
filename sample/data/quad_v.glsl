#version 300 es

in vec3 pos;
in vec2 tex;

out vec2 f_tex;

void main() {
	f_tex = tex;
	gl_Position = vec4(pos, 1.0);
}

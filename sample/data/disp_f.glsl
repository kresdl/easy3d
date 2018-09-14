#version 300 es
precision mediump float;

uniform sampler2D col;
uniform sampler2D disp;

layout(std140) uniform m1 {
	mat4 mat;
};

in vec2 f_tex;
out vec4 frag;

void main() {
	vec2 t = 0.5 * (vec4(2.0 * f_tex - 1.0, 0.0, 0.0) * mat).xy + 0.5;
	vec3 d = texture(disp, t).xyz;
	frag = min(1.0, 1.9 * pow(length(d.xy), 0.08)) * texture(col, f_tex + d.xy);												//Trådig, mindre plottrig, något jämn
}

export const shaderCode = {
 vertex: `#version 300 es
in vec3 aPosition;
in vec3 aNormal;
uniform mat4 uViewProj;
uniform mat4 uModel;
out vec3 vNormal;
out vec3 vWorld;
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(uModel) * aNormal);
  gl_Position = uViewProj * world;
}`,
 fragment: `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vWorld;
uniform vec4 uColor;
uniform vec3 uSelected;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(-0.45, 0.85, 0.4));
  float diffuse = max(dot(n, light), 0.0);
  float shade = 0.48 + diffuse * 0.52;
  vec3 rgb = uColor.rgb * shade;
  outColor = vec4(rgb, uColor.a);
}`
};
export default shaderCode;

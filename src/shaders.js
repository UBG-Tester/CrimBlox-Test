export const shaderCode={vertex:`#version 300 es
in vec3 aPosition; uniform vec3 uOffset; uniform vec3 uScale;
void main(){vec3 p=aPosition*uScale+uOffset; gl_Position=vec4(p.x*.7,p.y*.7-p.z*.12,(p.z+4.0)/12.0,1.0);}`,fragment:`#version 300 es
precision mediump float; uniform vec4 uColor; out vec4 outColor;
void main(){outColor=vec4(uColor.rgb*(.78+.22*gl_FragCoord.y/800.0),uColor.a);}`};
export default shaderCode;

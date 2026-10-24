#version 320 es
// <Semantic Name='TEXCOORD' Attribute='a_texcoord' />
// <Semantic Name='POSITION' Attribute='a_position' />
// <Semantic Name='COLOR' Attribute='a_color' />
// <Semantic Name='IDENTIFIER' Attribute='a_identifier' />
// <Semantic Name='NORMAL' Attribute='a_normal' />
// <Semantic Name='LIGHTLEVEL' Attribute='a_lightLevel' />
// <Semantic Name='PURELIGHT' Attribute='a_pureLight' />
// <Semantic Name='HEIGHTDATA' Attribute='a_heightData' />
uniform mat4 u_viewProjectionMatrix;
uniform vec2 u_origin;
uniform float u_lightTable[96];
layout(location = 0) in vec2 a_texcoord;
layout(location = 1) in vec3 a_position;
layout(location = 2) in vec4 a_color;
layout(location = 3) in uint a_identifier;
layout(location = 4) in vec3 a_normal;
layout(location = 5) in float a_lightLevel;
layout(location = 6) in float a_pureLight;
layout(location = 7) in float a_heightData;
out vec2 v_texcoord;
out vec4 v_color;
out vec3 v_normalEncoded;
flat out uint v_identifier;
void main() {
    int lightIndex = clamp(int(a_lightLevel) - 1, 0, 95);
    float light = clamp(u_lightTable[lightIndex], 0.0, 1.0);
    v_texcoord = a_texcoord;
    v_color = vec4(a_color.rgb * light, a_color.a);
    v_normalEncoded = clamp(a_normal / 255.0, 0.0, 1.0);
    v_identifier = a_identifier;
    vec3 relativePosition = vec3(a_position.x - u_origin.x, a_position.y, a_position.z - u_origin.y);
    gl_Position = u_viewProjectionMatrix * vec4(relativePosition, 1.0);
    OPENGL_POSITION_FIX;
}

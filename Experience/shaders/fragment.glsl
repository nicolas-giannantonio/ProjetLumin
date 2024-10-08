precision mediump float;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;

void main() {
//    vec3 color = vec3(vec2(vUv.x * vUv.y) + .20, 0.0);
    vec3 color = vColor;

    float strength = distance(vUv.xy, vec2(0.5));
    strength = step(0.5, strength);
    strength = 1.0 - strength;

    gl_FragColor = vec4(vec3(color), vAlpha);
}

precision mediump float;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;

void main() {
    vec3 color = vec3(vColor);

    gl_FragColor = vec4(color, vAlpha);
}

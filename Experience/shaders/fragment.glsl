// fragment.glsl

varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;
varying float uOpacity;
varying float uTime;

void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float smoothFactor = smoothstep(0.25, 0.5, distanceToCenter);

    vec3 color = vColor;
    float alpha = vAlpha * (1.0 - smoothFactor);

    color = mix(color, vec3(1.0, 1.0, 1.0), smoothFactor);

    gl_FragColor = vec4(color, alpha);
}

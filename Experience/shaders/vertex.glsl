attribute float size;
attribute float alpha;
attribute vec3 aColor;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;

void main() {
    vColor = aColor;
    vAlpha = alpha;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * (50.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vUv = mvPosition.xy;
}

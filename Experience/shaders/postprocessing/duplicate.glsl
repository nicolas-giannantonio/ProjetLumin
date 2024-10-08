precision highp float;

varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
    vec4 original = texture2D(tDiffuse, vUv);
    vec4 finalColor = vec4(0.);

    vec2 echoOffset = vec2(.5) * 0.0015;
    const int echoLayers = 25;

    float attenuation = .85;

    for (int i = 1; i <= echoLayers; i++) {
        float layerFactor = float(i);

        vec2 currentOffset = echoOffset * layerFactor;
        float alpha = pow(attenuation, layerFactor);
        finalColor += texture2D(tDiffuse, vUv + currentOffset) * alpha;
    }

    finalColor /= float(echoLayers);
    finalColor *= 25. + original * .25;

    gl_FragColor = finalColor;
}

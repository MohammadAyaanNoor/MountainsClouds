uniform sampler2D uNormalMap;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition; // Keep this for the transparency fade

void main() {
    // 1. Map normal texture with repeat * vec2(3.0, 5.0)
    vec3 texNormal = texture2D(uNormalMap, vUv * vec2(3.0, 5.0)).xyz * 2.0 - 1.0;
    
    // 2. Perturb the base normal
    vec3 perturbedNormal = normalize(vNormal + texNormal);

    // 3. Simple diffuse lighting with dot product
    vec3 lightDir = normalize(vec3(0.4, 0.5, 0.8));
    // Using max(0.0, ...) prevents negative lighting values on the dark side
    float diffuse = max(0.0, dot(perturbedNormal, lightDir));

    // 4. Mix two colors by this diffuse light (Matches Mountain Shader)
    vec3 colorDark = vec3(0.55, 0.64, 0.75);
    vec3 colorLight = vec3(0.96, 0.97, 0.98);
    vec3 finalColor = mix(colorDark, colorLight, diffuse);

    // 5. Transparency mask for peaks based on local Y position
    float alpha = smoothstep(-1.0, 0.4, vPosition.y);
    
    // Output final color with the calculated alpha fade
    gl_FragColor = vec4(finalColor, alpha);
}



// uniform sampler2D uRockDiffuse;
// uniform sampler2D uSnowDiffuse;
// uniform sampler2D uSnowRockMix;

// varying vec3 vNormal;
// varying vec2 vUv;
// varying vec3 vPosition;

// void main() {
//     // 1. Diffuse Lighting Calculation (Using original vNormal directly)
//     vec3 lightDir = normalize(vec3(0.4, 0.5, 0.8));
//     float diffuse = max(0.0, dot(vNormal, lightDir));

//     // 2. Base Rock Color 
//     vec3 rockTex = texture2D(uRockDiffuse, vUv * vec2(4.0, 4.0)).rgb;
//     vec3 rockColor = rockTex * (diffuse * 0.7 + 0.3);

//     // 3. Snow Color
//     vec3 snowTex = texture2D(uSnowDiffuse, vUv * vec2(5.0, 5.0)).rgb;
//     vec3 snowColor = snowTex * (diffuse * 0.4 + 0.6);

//     // 4. Read the Mask and Mix
//     float snowMask = texture2D(uSnowRockMix, vUv).r;
//     vec3 finalColor = mix(rockColor, snowColor, snowMask);
    

//     // 5. Transparency mask for peaks based on Y position
//     float alpha = smoothstep(-1.0, 0.4, vPosition.y);
    
//     gl_FragColor = vec4(finalColor, alpha);
// }



// uniform sampler2D uRockDiffuse;
// uniform sampler2D uSnowDiffuse;
// uniform sampler2D uSnowRockMix;

// varying vec3 vNormal;
// varying vec2 vUv;
// varying vec3 vPosition;

// void main() {
//     // 1. Diffuse Lighting Calculation
//     vec3 lightDir = normalize(vec3(0.4, 0.5, 0.8));
//     float diffuse = max(0.0, dot(vNormal, lightDir));

//     // 2. Base Rock Color 
//     vec3 rockTex = texture2D(uRockDiffuse, vUv * vec2(4.0, 4.0)).rgb;
//     vec3 rockColor = rockTex * (diffuse * 0.7 + 0.3);

//     // 3. Snow Color
//     vec3 snowTex = texture2D(uSnowDiffuse, vUv * vec2(5.0, 5.0)).rgb;
//     vec3 snowColor = snowTex * (diffuse * 0.4 + 0.6);

//     // 4. Read the Mask
//     float snowMask = texture2D(uSnowRockMix, vUv).r;
    
//     // --- NEW: Slope-Based Snow Blending ---
//     float slope = smoothstep(0.4, 0.8, vNormal.y); 
//     float finalSnowMask = min(snowMask, slope);

//     // 5. Mix using the NEW finalSnowMask
//     vec3 finalColor = mix(rockColor, snowColor, finalSnowMask);

//     // 6. Transparency mask for peaks based on Y position
//     float alpha = smoothstep(-1.0, 0.4, vPosition.y);
    
//     gl_FragColor = vec4(finalColor, alpha);
// }
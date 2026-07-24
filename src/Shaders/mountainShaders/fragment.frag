uniform sampler2D uNormalMap;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    // 1. Map normal texture with repeat * vec2(3.0, 5.0)
    vec3 texNormal = texture2D(uNormalMap, vUv * vec2(3.0, 5.0)).xyz * 2.0 - 1.0;
    
    // 2. Perturb the base normal
    vec3 perturbedNormal = normalize(vNormal + texNormal);

    // 3. Simple diffuse lighting with dot product
    vec3 lightDir = normalize(vec3(0.4, 0.5, 0.8));
    // Using max(0.0, ...) prevents negative lighting values on the dark side
    float diffuse = max(0.0, dot(perturbedNormal, lightDir));

    // 4. Mix two colors by this diffuse light
    vec3 colorDark = vec3(0.55, 0.64, 0.75);
    vec3 colorLight = vec3(0.96, 0.97, 0.98);
    vec3 finalColor = mix(colorDark, colorLight, diffuse);

    gl_FragColor = vec4(finalColor, 1.0);
  }





// uniform sampler2D uNormalMap;
// uniform sampler2D uSnowDiffuse;
// uniform sampler2D uSnowRockMix;
// uniform sampler2D uRockNormal;

// varying vec3 vNormal;
// varying vec2 vUv;

// void main() {
//     // 1. Normal Perturbation
//     vec3 texNormal = texture2D(uNormalMap, vUv * vec2(3.0, 5.0)).xyz * 2.0 - 1.0;
//     vec3 perturbedNormal = normalize(vNormal + texNormal);

//     // 2. Diffuse Lighting Calculation
//     vec3 lightDir = normalize(vec3(0.4, 0.5, 0.8));
//     float diffuse = max(0.0, dot(perturbedNormal, lightDir));

//     // 3. Base Rock Color
//     // I slightly darkened your original base colors so the rock contrasts better against the snow
//     vec3 rockDark = vec3(0.35, 0.44, 0.55); 
//     vec3 rockLight = vec3(0.66, 0.67, 0.68);
//     vec3 rockColor = mix(rockDark, rockLight, diffuse);

//     // 4. Snow Color
//     // We scale the UVs here so the snow texture tiles and gives detail
//     vec3 snowTex = texture2D(uSnowDiffuse, vUv * vec2(5.0, 5.0)).rgb;
//     // Add soft lighting to the snow so it doesn't look flat
//     vec3 snowColor = snowTex * (diffuse * 0.4 + 0.6); 

//     // 5. Read the Mask and Mix
//     // We use the raw vUv here so the mask fits the entire model perfectly
//     float snowMask = texture2D(uSnowRockMix, vUv).r;
    
//     // Mix the rock and snow based on the black & white mask
//     vec3 finalColor = mix(rockColor, snowColor, snowMask);

//     gl_FragColor = vec4(finalColor, 1.0);
// }




// uniform sampler2D uRockDiffuse;
// uniform sampler2D uSnowDiffuse;
// uniform sampler2D uSnowRockMix;

// varying vec3 vNormal;
// varying vec2 vUv;

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

//     gl_FragColor = vec4(finalColor, 1.0);
// }




// uniform sampler2D uRockDiffuse;
// uniform sampler2D uSnowDiffuse;
// uniform sampler2D uSnowRockMix;

// varying vec3 vNormal;
// varying vec2 vUv;

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
//     // 1.0 is pointing straight up (flat ground), 0.0 is a sheer cliff
//     float slope = smoothstep(0.4, 0.8, vNormal.y); 
//     // Combine your painted mask with the natural slope
//     float finalSnowMask = min(snowMask, slope);

//     // 5. Mix using the NEW finalSnowMask
//     vec3 finalColor = mix(rockColor, snowColor, finalSnowMask);

//     gl_FragColor = vec4(finalColor, 1.0);
// }
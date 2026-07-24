  uniform sampler2D uPerlin;
  uniform sampler2D uVoronoi;
  uniform sampler2D uNoise;
  uniform float uTime;
  varying vec2 vUv;
  varying float vAspect; // Available here for your cloud math

  void main() {
    // Output UVs as colors: Red = U (X-axis), Green = V (Y-axis)
    // You can now use vAspect here for SDFs or billboard corrections!

    vec2 ratioUv = vec2(5.0,5.0) * vUv;
    vec2 dUv = vUv;
    dUv.y += 0.3*(texture2D(uNoise,ratioUv * 0.2 + uTime*vec2(-0.004,-0.02)).r - 0.5);
    dUv.x += 0.3*(texture2D(uVoronoi,ratioUv * 0.2 + uTime*vec2(-0.004,-0.02)).r - 0.5);
    dUv.y -= 0.5*(texture2D(uNoise,ratioUv * 0.08 + uTime*vec2(0.005,0.01)).r - 0.5);
    dUv.x -= 0.5*(texture2D(uVoronoi,ratioUv * 0.08 + uTime*vec2(0.005,0.01)).r - 0.5);

    float smoothness = smoothstep(0.4,0.7,texture2D(uNoise ,ratioUv * 0.08 + vec2(-0.08,-0.04)*uTime).r);
    float clouds = smoothstep(0.9 - 0.1*smoothness,0.7,dUv.y);
    clouds *= smoothstep(0.0,0.2,dUv.y - 0.2*smoothstep(0.4,1.0,dUv.x));
    float alpha = clouds*smoothstep(1.0,0.9,vUv.y)*smoothstep(0.0,0.1,vUv.y)*smoothstep(1.0,0.9,vUv.x) *smoothstep(0.0,0.1,vUv.x);
    float cloudDarkness = smoothstep(0.4,1.0,dUv.y) + smoothstep(0.4,0.0,dUv.y);
    vec3 color = mix(vec3(0.82,0.86,0.88),1.1*vec3(0.96,0.96,0.96),cloudDarkness);

    gl_FragColor = vec4(vec3(color), alpha); 
  }



//   uniform sampler2D uPerlin;
// uniform sampler2D uNoise;
// uniform sampler2D uVoronoi; // New Voronoi map
// uniform float uTime;
// varying vec2 vUv;
// varying float vAspect; 

// void main() {
//     vec2 ratioUv = vec2(5.0, 5.0) * vUv;
//     vec2 dUv = vUv;
    
//     // 1. SAMPLE VORONOI
//     // Scroll the voronoi at a slightly different speed/angle for organic blending
//     float voroScroll = texture2D(uVoronoi, ratioUv * 0.3 + uTime * vec2(0.01, -0.015)).r;

//     // 2. ADD FLUFFINESS: Mix Perlin, Noise, and Voronoi
//     dUv.y += 0.3 * (texture2D(uPerlin, ratioUv * 0.15 + uTime * vec2(-0.004, -0.02)).r - 0.5);
//     dUv.y -= 0.2 * (texture2D(uNoise, ratioUv * 0.4 + uTime * vec2(0.01, 0.01)).r - 0.5);
//     // Warp the X axis slightly using the voronoi to create "clumpy" side-profiles
//     dUv.x += 0.1 * (voroScroll - 0.5);

//     // 3. BASE DENSITY
//     float noiseMap = texture2D(uPerlin, ratioUv * 0.08 + vec2(-0.08, -0.04) * uTime).r;
//     // Mix the bubbly Voronoi cells into the smooth Perlin noise
//     noiseMap = mix(noiseMap, voroScroll, 0.35); 
    
//     float smoothness = smoothstep(0.4, 0.7, noiseMap);
    
//     // 4. FAKE 3D LIGHTING (Directional Derivative)
//     vec2 sunDir = vec2(0.03, -0.03); 
    
//     // Sample both textures again, but offset towards the "sun"
//     float offsetNoise = texture2D(uPerlin, ratioUv * 0.08 + sunDir + vec2(-0.08, -0.04) * uTime).r;
//     float offsetVoro = texture2D(uVoronoi, ratioUv * 0.3 + sunDir + uTime * vec2(0.01, -0.015)).r;
    
//     // Mix the offset samples exactly like we did the base samples
//     offsetNoise = mix(offsetNoise, offsetVoro, 0.35);
//     float offsetSmoothness = smoothstep(0.4, 0.7, offsetNoise);
    
//     // Compare to find edges facing the light
//     float densityDiff = smoothness - offsetSmoothness; 
    
//     float highlight = smoothstep(0.0, 0.15, densityDiff); 
//     float selfShadow = smoothstep(0.0, -0.15, densityDiff);   

//     // 5. CLOUD SHAPE & ALPHA
//     float clouds = smoothstep(0.9 - 0.2 * smoothness, 0.6, dUv.y);
//     clouds *= smoothstep(0.0, 0.2, dUv.y - 0.2 * smoothstep(0.4, 1.0, dUv.x));
    
//     clouds *= mix(0.7, 1.0, texture2D(uNoise, ratioUv * 0.5).r);

//     // 6. COLOR MIXING
//     vec3 baseColor = vec3(0.85, 0.88, 0.90);
//     vec3 shadowColor = vec3(0.55, 0.62, 0.72); 
//     vec3 highlightColor = vec3(1.0, 1.0, 1.0); 

//     vec3 finalColor = baseColor;
//     float depthShadow = smoothstep(0.6, 1.0, dUv.y);
    
//     finalColor = mix(finalColor, shadowColor, clamp(selfShadow + depthShadow, 0.0, 1.0));
//     finalColor = mix(finalColor, highlightColor, highlight);

//     // Screen borders fade logic
//     float alpha = clouds * smoothstep(1.0, 0.9, vUv.y) * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.x) * smoothstep(0.0, 0.1, vUv.x);

//     gl_FragColor = vec4(finalColor, alpha); 
// }
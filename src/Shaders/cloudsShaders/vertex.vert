varying vec2 vUv;
  varying float vAspect; // New varying to pass aspect ratio to fragment shader

  void main() {
    vUv = uv; 

    vec4 localPosition = vec4(position, 1.0);
    vec4 mvPosition;
    
    // Default aspect ratio if not using instanced mesh
    float aspect = 1.0; 

    #ifdef USE_INSTANCING
      // 1. Apply instance matrix to local position
      localPosition = instanceMatrix * localPosition;
      
      // 2. Assign mvPosition
      mvPosition = modelViewMatrix * localPosition;

      // 3. Extract scale X and Y from the instance matrix columns
      float scaleX = instanceMatrix[0][0];
      float scaleY = instanceMatrix[1][1];
      
      // Calculate aspect ratio
      aspect = scaleX / scaleY;
    #else
      // Standard mvPosition if not instanced
      mvPosition = modelViewMatrix * localPosition;
    #endif

    vAspect = aspect;

    gl_Position = projectionMatrix * mvPosition;
  }
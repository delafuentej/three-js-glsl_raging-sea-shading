uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/perlinClassic3D.glsl

float waveElevation(vec3 position){
    //the float elevation => we have to take this into account if we want to include 
    // a model in the project that moves up and down according to its value.
    float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
                      sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
                      uBigWavesElevation;

    for(float i = 1.0; i <= uSmallIterations; i++)
    {
        elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }

    return elevation;

}

void main()
{
    // Base Position
    float shift = 0.01;// how far the neighbours are going to be
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    //neighbour A:
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    //neighbour B: we use - shift because of the cross product
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, - shift);

   

    // Elevation
   float elevation = waveElevation(modelPosition.xyz);
    
    modelPosition.y += elevation;
    // Update neighbours elevation according to the waves
     modelPositionA.y += waveElevation(modelPositionA);
     modelPositionB.y += waveElevation(modelPositionB);

     //Compute normal: Calculation neigbours directions (destination - origin). 
     //This vectors should be normalized because we are going to use them
     // with a cross product function wich require that
     vec3 toA = normalize(modelPositionA - modelPosition.xyz);
     vec3 toB = normalize(modelPositionB - modelPosition.xyz);

     vec3 computeNormal = cross(toA, toB);

    //Model Normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    //Final Position
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    //Varyings
    vElevation = elevation;
    //vNormal = modelNormal.xyz;
    vNormal = computeNormal;
    vPosition = modelPosition.xyz;
}
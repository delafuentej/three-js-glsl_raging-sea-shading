uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;


#include ../includes/directionalLight.glsl
#include ../includes/pointLight.glsl

void main(){

    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    //Base Color
    float mixStrength = (vElevation +  uColorOffset) * uColorMultiplier;
    //enhance the gradients feel by applying a smoothstep to mixStrength:
    mixStrength = smoothstep(0.0, 1.0, mixStrength);// to become more intensives colors
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    //Lights
    vec3 light = vec3(0.0);
    // light += directionalLight(
    //     vec3(1.0),//Light color
    //     1.0,//Light intensity
    //     normal, //normal instead vNormal
    //     vec3(-1.0, 0.5, 0.0), //light position
    //     viewDirection, // view Direction
    //     30.0 // specular power
    // );

     light += pointLight(
        vec3(1.0),//Light color
        10.0,//Light intensity
        normal, //normal instead vNormal
        vec3(0.0, 0.25, 0.0), //light position
        viewDirection, // view Direction
        30.0, // specular power
        vPosition, //position
        0.95 //light decay
    );



      color *= light;
    //Final Color
    gl_FragColor = vec4(color, 1.0);
     #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
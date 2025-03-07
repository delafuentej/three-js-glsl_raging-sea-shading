vec3 pointLight(
    vec3 lightColor, 
    float lightIntensity, 
    vec3 normal, 
    vec3 lightPosition, 
    vec3 viewDirection, 
    float specularPower, 
    vec3 position,
    float lightDecay
    ){

    vec3 lightDelta = lightPosition - position;//light direction
    float lightDistance = length(lightDelta);
    vec3 lightDirection = normalize(lightDelta);
    vec3 lightReflection = reflect( - lightDirection, normal);


    //shading
    float shading = dot(normal, lightDirection);
    shading = max(0.0, shading);// shading value never is negative

    //Specular
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, specularPower);

    //Decay
    float decay = 1.0 - lightDistance * lightDecay;// no realistic
    decay = max(0.0, decay);


   // return vec3(decay);
    return lightColor * lightIntensity *  decay * (shading + specular);

}
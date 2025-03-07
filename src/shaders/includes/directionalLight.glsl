vec3 directionalLight(
    vec3 lightColor, 
    float lightIntensity, 
    vec3 normal, 
    vec3 lightPosition, 
    vec3 viewDirection, 
    float specularPower){

    
    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect( - lightDirection, normal);

    //shading
    float shading = dot(normal, lightDirection);
    shading = max(0.0, shading);// shading value never is negative

    //Specular
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, specularPower);

 //return vec3(specular); specular depends on the lightColor & lightIntensity
 //   return lightColor * lightIntensity * shading + (lightColor * lightIntensity * specular);
    return lightColor * lightIntensity * (shading + specular);

}